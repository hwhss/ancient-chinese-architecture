const config = require('../config');
const {
  getAIAnswer,
  normalizeQuestion,
  rewriteKnowledgeAnswer
} = require('../../services/aiService');
const { findBestKnowledgeByHybrid } = require('./retrieval/hybridRetriever');
const { resolveBuildingEntities } = require('./entityMatcher');

async function getChatResponse(question) {
  const rawQuestion = String(question || '').trim();
  const retrievalQuestion = config.enableQuestionNormalize
    ? await normalizeQuestion(rawQuestion)
    : rawQuestion;
  const usedNormalizedQuestion = retrievalQuestion !== rawQuestion;

  const debug = {
    rawQuestion,
    retrievalQuestion,
    usedNormalizedQuestion,
    vectorRetrievalEnabled: Boolean(config.enableVectorRetrieval && config.dataSource === 'postgres'),
    dataSource: config.dataSource,
    matchedBy: 'none',
    rewriteApplied: false
  };

  let knowledgeDecision = await findBestKnowledgeByHybrid(retrievalQuestion);
  if ((!knowledgeDecision || !knowledgeDecision.accepted) && retrievalQuestion !== rawQuestion) {
    debug.fallbackToRawQuestion = true;
    knowledgeDecision = await findBestKnowledgeByHybrid(rawQuestion);
  } else {
    debug.fallbackToRawQuestion = false;
  }

  if (knowledgeDecision && knowledgeDecision.accepted) {
    debug.matchedBy = knowledgeDecision.source;
    debug.knowledgeDecision = {
      accepted: true,
      reason: knowledgeDecision.reason || 'accepted'
    };
    if (knowledgeDecision.debug) {
      debug.matchScore = {
        keywordScore: knowledgeDecision.debug.keywordScore,
        vectorSimilarity: knowledgeDecision.debug.vectorSimilarity,
        hybridScore: knowledgeDecision.debug.hybridScore,
        decisionScore: knowledgeDecision.debug.decisionScore
      };
      debug.retrievalTopCandidates = knowledgeDecision.debug.topCandidates || [];
    }

    const answer = config.enableChatRewrite
      ? await rewriteKnowledgeAnswer(rawQuestion, knowledgeDecision.answer)
      : knowledgeDecision.answer;

    const entityMatch = await resolveBuildingEntities(rawQuestion, answer, {
      preferredId: knowledgeDecision.materialId || null
    });
    const materialId = knowledgeDecision.materialId || (entityMatch.primary ? entityMatch.primary.id : null);

    debug.rewriteApplied = Boolean(config.enableChatRewrite);
    if (config.chatDebugEnabled) {
      debug.entityPostMatch = {
        primary: entityMatch.primary,
        entities: entityMatch.entities,
        decision: entityMatch.decision
      };
    }

    return {
      answer,
      source: knowledgeDecision.source,
      materialId,
      matchedEntity: entityMatch.primary,
      entities: entityMatch.entities,
      entityDecision: entityMatch.decision,
      debug: config.chatDebugEnabled ? debug : undefined
    };
  }

  const answer = await getAIAnswer(rawQuestion);
  const entityMatch = await resolveBuildingEntities(rawQuestion, answer);
  debug.matchedBy = 'ai_fallback';
  debug.knowledgeDecision = {
    accepted: false,
    reason: (knowledgeDecision && knowledgeDecision.reason) || 'not_accepted'
  };
  if (knowledgeDecision && knowledgeDecision.debug && knowledgeDecision.debug.topCandidates) {
    debug.retrievalTopCandidates = knowledgeDecision.debug.topCandidates;
  }
  if (config.chatDebugEnabled) {
    debug.entityPostMatch = {
      primary: entityMatch.primary,
      entities: entityMatch.entities,
      decision: entityMatch.decision
    };
  }

  return {
    answer,
    source: 'ai',
    materialId: entityMatch.primary ? entityMatch.primary.id : null,
    matchedEntity: entityMatch.primary,
    entities: entityMatch.entities,
    entityDecision: entityMatch.decision,
    debug: config.chatDebugEnabled ? debug : undefined
  };
}

module.exports = {
  getChatResponse
};
