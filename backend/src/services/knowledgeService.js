const config = require('../config');
const { searchKeywordCandidates } = require('./retrieval/keywordRetriever');

async function findBestKnowledgeMatch(question) {
  const candidates = await searchKeywordCandidates(question);
  const best = candidates[0];

  if (!best || best.keywordScore < config.chatKeywordScoreThreshold) {
    return null;
  }

  return {
    id: best.id,
    question: best.question,
    answer: best.answer,
    materialId: best.materialId || null,
    keywords: best.keywords,
    score: best.keywordScore
  };
}

module.exports = {
  findBestKnowledgeMatch
};
