function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function buildCandidateKey(item) {
  if (item && item.id) {
    return `id:${item.id}`;
  }
  return `q:${normalizeText(item && item.question)}`;
}

module.exports = {
  normalizeText,
  buildCandidateKey
};
