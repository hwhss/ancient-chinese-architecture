const { getAIAnswer } = require('../../services/aiService');
const { findBestKnowledgeByHybrid } = require('./retrieval/hybridRetriever');

async function getChatResponse(question) {
  const knowledgeMatched = await findBestKnowledgeByHybrid(question);
  if (knowledgeMatched) {
    return {
      answer: knowledgeMatched.answer,
      source: knowledgeMatched.source,
      materialId: knowledgeMatched.materialId || null
    };
  }

  const answer = await getAIAnswer(question);
  return {
    answer,
    source: 'ai',
    materialId: null
  };
}

module.exports = {
  getChatResponse
};
