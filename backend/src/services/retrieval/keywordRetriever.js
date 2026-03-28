const { getKnowledgeBase } = require('../../repositories/dataRepository');
const config = require('../../config');
const { normalizeText, buildCandidateKey } = require('./textUtils');

function scoreKeywordMatch(normalizedQuestion, item) {
  const questionText = normalizeText(item.question);
  const keywords = Array.isArray(item.keywords) ? item.keywords : [];

  let score = 0;

  if (questionText && normalizedQuestion.includes(questionText)) {
    score += 100;
  }

  if (questionText && questionText.includes(normalizedQuestion)) {
    score += 30;
  }

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && normalizedQuestion.includes(normalizedKeyword)) {
      score += 20;
    }
  }

  return score;
}

function normalizeKeywordScore(score) {
  return Math.min(score / 100, 1);
}

async function searchKeywordCandidates(question, limit = config.chatKeywordTopK) {
  const list = await getKnowledgeBase();
  const normalizedQuestion = normalizeText(question);

  if (!list.length || !normalizedQuestion) {
    return [];
  }

  const candidates = list
    .map((item) => {
      const keywordScore = scoreKeywordMatch(normalizedQuestion, item);
      return {
        id: item.id || null,
        key: buildCandidateKey(item),
        question: item.question,
        answer: item.answer,
        materialId: item.materialId || null,
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        keywordScore,
        keywordConfidence: normalizeKeywordScore(keywordScore)
      };
    })
    .filter((item) => item.keywordScore > 0)
    .sort((a, b) => b.keywordScore - a.keywordScore)
    .slice(0, limit);

  return candidates;
}

module.exports = {
  searchKeywordCandidates,
  scoreKeywordMatch,
  normalizeKeywordScore
};
