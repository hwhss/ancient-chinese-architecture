const axios = require('axios');
const config = require('../config');

let hasWarnedMissingEmbeddingConfig = false;

function warnMissingEmbeddingConfig() {
  if (!hasWarnedMissingEmbeddingConfig) {
    console.warn('⚠️ 向量检索已启用，但 EMBEDDING_API_URL / EMBEDDING_API_KEY / EMBEDDING_MODEL 未完整配置，将自动降级。');
    hasWarnedMissingEmbeddingConfig = true;
  }
}

function parseEmbeddingResponse(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // OpenAI-compatible response: { data: [{ embedding: [...] }] }
  if (Array.isArray(data.data) && data.data.length > 0 && Array.isArray(data.data[0].embedding)) {
    return data.data[0].embedding;
  }

  // Some providers may return { embedding: [...] }
  if (Array.isArray(data.embedding)) {
    return data.embedding;
  }

  // Some providers may return { output: { embedding: [...] } }
  if (data.output && Array.isArray(data.output.embedding)) {
    return data.output.embedding;
  }

  // Some providers may return { output: { embeddings: [{ embedding: [...] }] } }
  if (
    data.output &&
    Array.isArray(data.output.embeddings) &&
    data.output.embeddings.length > 0 &&
    Array.isArray(data.output.embeddings[0].embedding)
  ) {
    return data.output.embeddings[0].embedding;
  }

  return null;
}

function formatVectorLiteral(embedding) {
  return `[${embedding.join(',')}]`;
}

function buildEmbeddingEndpoint(baseUrl) {
  const normalized = String(baseUrl || '').replace(/\/$/, '');
  if (normalized.endsWith('/embeddings')) {
    return normalized;
  }
  return `${normalized}/embeddings`;
}

async function createEmbedding(text) {
  const input = String(text || '').trim();
  if (!input) {
    return null;
  }

  if (!config.embeddingApiUrl || !config.embeddingApiKey || !config.embeddingModel) {
    warnMissingEmbeddingConfig();
    return null;
  }

  try {
    const endpoint = buildEmbeddingEndpoint(config.embeddingApiUrl);
    const response = await axios.post(
      endpoint,
      {
        model: config.embeddingModel,
        input
      },
      {
        headers: {
          Authorization: `Bearer ${config.embeddingApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const embedding = parseEmbeddingResponse(response.data);
    if (!Array.isArray(embedding) || !embedding.length) {
      return null;
    }

    return embedding;
  } catch (error) {
    console.error(`❌ Embedding 调用失败(${config.embeddingProvider}):`, error.message);
    return null;
  }
}

module.exports = {
  createEmbedding,
  formatVectorLiteral
};
