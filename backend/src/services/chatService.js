const config = require('../config');
const {
  getAIAnswer,
  normalizeQuestion,
  rewriteKnowledgeAnswer
} = require('../../services/aiService');
const { findBestKnowledgeByHybrid } = require('./retrieval/hybridRetriever');

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

    debug.rewriteApplied = Boolean(config.enableChatRewrite);

    return {
      answer,
      source: knowledgeMatched.source,
      materialId: knowledgeMatched.materialId || null,
      debug: config.chatDebugEnabled ? debug : undefined
    };
  }

  const answer = await getAIAnswer(rawQuestion);
  debug.matchedBy = 'ai_fallback';

  return {
    answer,
    source: 'ai',
    materialId: null,
    debug: config.chatDebugEnabled ? debug : undefined
  };
}

module.exports = {
  getChatResponse
};
