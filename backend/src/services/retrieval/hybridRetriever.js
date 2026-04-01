const config = require('../../config');
const { searchKeywordCandidates } = require('./keywordRetriever');
const { searchVectorCandidates } = require('../vectorSearchService');

function clamp(value, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function normalizeKeywordScore(keywordScore) {
  const threshold = Math.max(Number(config.chatKeywordStrongThreshold) || 60, 1);
  return clamp((Number(keywordScore) || 0) / threshold);
}

function normalizeVectorSimilarity(vectorSimilarity) {
  const minDomain = clamp(Number(config.chatVectorMinDomainSimilarity) || 0.45);
  const raw = Number(vectorSimilarity) || 0;
  if (raw <= minDomain) {
    return 0;
  }
  const normalized = (raw - minDomain) / Math.max(1 - minDomain, 0.0001);
  return clamp(normalized);
}

function toHybridScore(keywordScore, vectorSimilarity) {
  const keywordCalibrated = normalizeKeywordScore(keywordScore);
  const vectorCalibrated = normalizeVectorSimilarity(vectorSimilarity);
  return (keywordCalibrated * config.chatHybridKeywordWeight) +
    (vectorCalibrated * config.chatHybridVectorWeight);
}

function mergeCandidates(keywordCandidates, vectorCandidates) {
  const mergedMap = new Map();

  for (const item of keywordCandidates) {
    mergedMap.set(item.key, {
      ...item,
      vectorSimilarity: 0
    });
  }

  for (const item of vectorCandidates) {
    const current = mergedMap.get(item.key);
    if (!current) {
      mergedMap.set(item.key, {
        ...item,
        keywordScore: 0,
        keywordConfidence: 0
      });
      continue;
    }

    mergedMap.set(item.key, {
      ...current,
      vectorSimilarity: item.vectorSimilarity,
      id: current.id || item.id,
      materialId: current.materialId || item.materialId || null,
      answer: current.answer || item.answer,
      question: current.question || item.question,
      keywords: current.keywords.length ? current.keywords : item.keywords
    });
  }

  return Array.from(mergedMap.values())
    .map((item) => {
      const keywordCalibrated = normalizeKeywordScore(item.keywordScore || 0);
      const vectorCalibrated = normalizeVectorSimilarity(item.vectorSimilarity || 0);
      const agreementBonus = Math.min(keywordCalibrated, vectorCalibrated) * 0.2;
      const hybridScore = toHybridScore(item.keywordScore || 0, item.vectorSimilarity || 0);
      const decisionScore = clamp(hybridScore + agreementBonus);
      return {
        ...item,
        keywordCalibrated,
        vectorCalibrated,
        agreementBonus,
        hybridScore,
        decisionScore
      };
    })
    .sort((a, b) => b.decisionScore - a.decisionScore);
}

function resolveSource(candidate) {
  const hasKeyword = (candidate.keywordScore || 0) >= config.chatKeywordStrongThreshold;
  const hasVector = (candidate.vectorSimilarity || 0) >= config.chatVectorSimilarityThreshold;

  if (hasKeyword && hasVector) {
    return 'knowledge_hybrid';
  }
  if (hasKeyword) {
    return 'knowledge_base';
  }
  if (hasVector) {
    return 'knowledge_vector';
  }
  return 'knowledge_candidate';
}

function buildTopCandidateSummary(candidate) {
  return {
    id: candidate.id || null,
    question: candidate.question,
    materialId: candidate.materialId || null,
    keywordScore: Number(candidate.keywordScore || 0),
    vectorSimilarity: Number(candidate.vectorSimilarity || 0),
    hybridScore: Number((candidate.hybridScore || 0).toFixed(4)),
    decisionScore: Number((candidate.decisionScore || 0).toFixed(4))
  };
}

function decideKnowledgeCandidate(candidates) {
  const best = candidates[0];
  const second = candidates[1] || null;

  if (!best) {
    return {
      accepted: false,
      reason: 'no_candidate',
      best: null,
      topCandidates: []
    };
  }

  if ((best.keywordScore || 0) >= config.chatKeywordStrongThreshold) {
    return {
      accepted: true,
      reason: 'strong_keyword_rule',
      best,
      topCandidates: candidates.slice(0, 3).map(buildTopCandidateSummary)
    };
  }

  const minDecisionScore = Number(config.chatDecisionMinScore) || 0.45;
  const minDecisionGap = Number(config.chatDecisionMinGap) || 0.08;
  const bestScore = Number(best.decisionScore || 0);
  const secondScore = Number(second ? second.decisionScore : 0);
  const scoreGap = bestScore - secondScore;

  if (bestScore < minDecisionScore) {
    return {
      accepted: false,
      reason: 'decision_score_too_low',
      best,
      topCandidates: candidates.slice(0, 3).map(buildTopCandidateSummary)
    };
  }

  if (second && scoreGap < minDecisionGap) {
    return {
      accepted: false,
      reason: 'decision_gap_too_small',
      best,
      topCandidates: candidates.slice(0, 3).map(buildTopCandidateSummary)
    };
  }

  const vectorOnly = Number(best.keywordScore || 0) <= 0;
  const vectorOnlyAcceptThreshold = Number(config.chatVectorOnlyAcceptThreshold) || 0.78;
  if (vectorOnly && Number(best.vectorSimilarity || 0) < vectorOnlyAcceptThreshold) {
    return {
      accepted: false,
      reason: 'vector_only_not_reliable',
      best,
      topCandidates: candidates.slice(0, 3).map(buildTopCandidateSummary)
    };
  }

  return {
    accepted: true,
    reason: 'decision_policy_accept',
    best,
    topCandidates: candidates.slice(0, 3).map(buildTopCandidateSummary)
  };
}

async function findBestKnowledgeByHybrid(question) {
  const keywordCandidates = await searchKeywordCandidates(question, config.chatKeywordTopK);
  const vectorCandidates = await searchVectorCandidates(question, config.chatVectorTopK);
  const merged = mergeCandidates(keywordCandidates, vectorCandidates);
  const decision = decideKnowledgeCandidate(merged);

  if (!decision.accepted || !decision.best) {
    return {
      accepted: false,
      reason: decision.reason,
      debug: {
        topCandidates: decision.topCandidates,
        keywordCandidateCount: keywordCandidates.length,
        vectorCandidateCount: vectorCandidates.length
      }
    };
  }

  return {
    accepted: true,
    answer: decision.best.answer,
    source: resolveSource(decision.best),
    materialId: decision.best.materialId || null,
    reason: decision.reason,
    debug: {
      keywordScore: decision.best.keywordScore || 0,
      vectorSimilarity: decision.best.vectorSimilarity || 0,
      hybridScore: decision.best.hybridScore || 0,
      decisionScore: decision.best.decisionScore || 0,
      topCandidates: decision.topCandidates
    }
  };
}

module.exports = {
  findBestKnowledgeByHybrid,
  mergeCandidates,
  toHybridScore,
  decideKnowledgeCandidate,
  normalizeKeywordScore,
  normalizeVectorSimilarity
};
