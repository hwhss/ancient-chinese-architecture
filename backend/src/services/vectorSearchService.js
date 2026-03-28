const config = require('../config');
const { query } = require('../config/database');
const { createEmbedding, formatVectorLiteral } = require('./embeddingService');
const { buildCandidateKey } = require('./retrieval/textUtils');

let hasWarnedVectorTableMissing = false;

function isVectorRetrievalEnabled() {
  return config.enableVectorRetrieval && config.dataSource === 'postgres';
}

function warnVectorTableMissingOnce(message) {
  if (!hasWarnedVectorTableMissing) {
    console.warn(message);
    hasWarnedVectorTableMissing = true;
  }
}

async function findBestVectorKnowledgeMatch(question) {
  const candidates = await searchVectorCandidates(question, config.chatVectorTopK);
  if (!candidates.length) {
    return null;
  }

  const best = candidates[0];
  if (best.vectorSimilarity < config.chatVectorSimilarityThreshold) {
    return null;
  }

  return {
    id: best.id,
    question: best.question,
    answer: best.answer,
    materialId: best.materialId || null,
    keywords: best.keywords,
    similarity: best.vectorSimilarity
  };
}

async function searchVectorCandidates(question, limit = config.chatVectorTopK) {
  if (!isVectorRetrievalEnabled()) {
    return [];
  }

  const embedding = await createEmbedding(question);
  if (!embedding) {
    return [];
  }

  const vectorLiteral = formatVectorLiteral(embedding);
  const sql = `
    SELECT
      kb.id,
      kb.question,
      kb.answer,
      kb.material_id,
      kb.keywords,
      1 - (ke.embedding <=> $1::vector) AS similarity
    FROM knowledge_embeddings ke
    JOIN knowledge_base kb ON kb.id = ke.knowledge_id
    WHERE ke.embedding_model = $2
      AND ke.embedding_dim = $3
    ORDER BY ke.embedding <=> $1::vector
    LIMIT $4
  `;

  try {
    const rows = await query(sql, [
      vectorLiteral,
      config.embeddingModel,
      config.embeddingDim,
      limit
    ]);

    return rows
      .map((row) => ({
        id: row.id || null,
        key: buildCandidateKey({ id: row.id, question: row.question }),
        question: row.question,
        answer: row.answer,
        materialId: row.material_id || null,
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        vectorSimilarity: Number(row.similarity) || 0
      }))
      .filter((item) => item.vectorSimilarity > 0)
      .sort((a, b) => b.vectorSimilarity - a.vectorSimilarity);
  } catch (error) {
    if (error && error.code === '42P01') {
      warnVectorTableMissingOnce('⚠️ 未检测到 knowledge_embeddings 表，向量检索自动降级。');
      return [];
    }

    console.error('❌ 向量检索异常，已自动降级:', error.message);
    return [];
  }
}

module.exports = {
  isVectorRetrievalEnabled,
  findBestVectorKnowledgeMatch,
  searchVectorCandidates
};
