const { getKnowledgeBase } = require('../repositories/dataRepository');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function findBestKnowledgeMatch(question) {
  const list = getKnowledgeBase();
  if (!list.length) {
    return null;
  }

  const normalizedQuestion = normalizeText(question);
  if (!normalizedQuestion) {
    return null;
  }

  let best = null;

  for (const item of list) {
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

    if (!best || score > best.score) {
      best = {
        item,
        score
      };
    }
  }

  if (!best || best.score < 20) {
    return null;
  }

  return best.item;
}

module.exports = {
  findBestKnowledgeMatch
};
