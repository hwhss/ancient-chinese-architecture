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

  let knowledgeMatched = await findBestKnowledgeByHybrid(retrievalQuestion);
  if (!knowledgeMatched && retrievalQuestion !== rawQuestion) {
    debug.fallbackToRawQuestion = true;
    knowledgeMatched = await findBestKnowledgeByHybrid(rawQuestion);
  } else {
    debug.fallbackToRawQuestion = false;
  }

  if (knowledgeMatched) {
    debug.matchedBy = knowledgeMatched.source;
    if (knowledgeMatched.debug) {
      debug.matchScore = {
        keywordScore: knowledgeMatched.debug.keywordScore,
        vectorSimilarity: knowledgeMatched.debug.vectorSimilarity,
        hybridScore: knowledgeMatched.debug.hybridScore
      };
    }

    const answer = config.enableChatRewrite
      ? await rewriteKnowledgeAnswer(rawQuestion, knowledgeMatched.answer)
      : knowledgeMatched.answer;

    const entityMatch = await resolveBuildingEntities(rawQuestion, answer, {
      preferredId: knowledgeMatched.materialId || null
    });
    const materialId = knowledgeMatched.materialId || (entityMatch.primary ? entityMatch.primary.id : null);

    debug.rewriteApplied = Boolean(config.enableChatRewrite);
    if (config.chatDebugEnabled) {
      debug.entityPostMatch = {
        primary: entityMatch.primary,
        entities: entityMatch.entities
      };
    }

    return {
      answer,
      source: knowledgeMatched.source,
      materialId,
      matchedEntity: entityMatch.primary,
      entities: entityMatch.entities,
      debug: config.chatDebugEnabled ? debug : undefined
    };
  }

  const answer = await getAIAnswer(rawQuestion);
  const entityMatch = await resolveBuildingEntities(rawQuestion, answer);
  debug.matchedBy = 'ai_fallback';
  if (config.chatDebugEnabled) {
    debug.entityPostMatch = {
      primary: entityMatch.primary,
      entities: entityMatch.entities
    };
  }

  return {
    answer,
    source: 'ai',
    materialId: entityMatch.primary ? entityMatch.primary.id : null,
    matchedEntity: entityMatch.primary,
    entities: entityMatch.entities,
    debug: config.chatDebugEnabled ? debug : undefined
  };
}

module.exports = {
  getChatResponse
};
