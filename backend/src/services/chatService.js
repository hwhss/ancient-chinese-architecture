const { getAIAnswer } = require('../../services/aiService');
const { findBestKnowledgeMatch } = require('./knowledgeService');

async function getChatResponse(question) {
  const matched = findBestKnowledgeMatch(question);

  if (matched) {
    return {
      answer: matched.answer,
      source: 'knowledge_base',
      materialId: matched.materialId || null
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
