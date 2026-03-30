const config = require('../../config');
const { searchKeywordCandidates } = require('./keywordRetriever');
const { searchVectorCandidates } = require('../vectorSearchService');

function toHybridScore(keywordConfidence, vectorSimilarity) {
  return (keywordConfidence * config.chatHybridKeywordWeight) +
    (vectorSimilarity * config.chatHybridVectorWeight);
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

  const merged = Array.from(mergedMap.values())
    .map((item) => {
      const hybridScore = toHybridScore(item.keywordConfidence || 0, item.vectorSimilarity || 0);
      return {
        ...item,
        hybridScore
      };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore);

  return merged;
}

function resolveSource(candidate) {
  const hasKeyword = (candidate.keywordScore || 0) >= config.chatKeywordStrongThreshold;
  const hasVector = (candidate.vectorSimilarity || 0) >= config.chatVectorSimilarityThreshold;
  const hasHybrid = (candidate.hybridScore || 0) >= config.chatHybridScoreThreshold;

  if (hasKeyword && hasVector) {
    return 'knowledge_hybrid';
  }
  if (hasHybrid) {
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

async function findBestKnowledgeByHybrid(question) {
  const keywordCandidates = await searchKeywordCandidates(question, config.chatKeywordTopK);

  const strongKeywordHit = keywordCandidates[0];
  if (strongKeywordHit && strongKeywordHit.keywordScore >= config.chatKeywordStrongThreshold) {
    return {
      answer: strongKeywordHit.answer,
      source: 'knowledge_base',
      materialId: strongKeywordHit.materialId,
      debug: {
        keywordScore: strongKeywordHit.keywordScore,
        vectorSimilarity: 0,
        hybridScore: strongKeywordHit.keywordConfidence
      }
    };
  }

  const vectorCandidates = await searchVectorCandidates(question, config.chatVectorTopK);
  const merged = mergeCandidates(keywordCandidates, vectorCandidates);
  const best = merged[0];

  if (!best) {
    return null;
  }

  const passHybrid = best.hybridScore >= config.chatHybridScoreThreshold;
  const passKeyword = (best.keywordScore || 0) >= config.chatKeywordStrongThreshold;
  const passVector = (best.vectorSimilarity || 0) >= config.chatVectorSimilarityThreshold;

  const keywordScore = Number(best.keywordScore || 0);
  const vectorSimilarity = Number(best.vectorSimilarity || 0);
  const shouldGuardLowDomainSimilarity =
    keywordScore <= 0 &&
    vectorSimilarity < config.chatVectorMinDomainSimilarity;

  if (shouldGuardLowDomainSimilarity) {
    return null;
  }

  if (!passHybrid && !passKeyword && !passVector) {
    return null;
  }

  return {
    answer: best.answer,
    source: resolveSource(best),
    materialId: best.materialId || null,
    debug: {
      keywordScore: best.keywordScore || 0,
      vectorSimilarity: best.vectorSimilarity || 0,
      hybridScore: best.hybridScore
    }
  };
}

module.exports = {
  findBestKnowledgeByHybrid,
  mergeCandidates,
  toHybridScore
};
