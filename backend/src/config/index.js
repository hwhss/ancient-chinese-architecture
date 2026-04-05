function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
  }

  return fallback;
}

const port = toNumber(process.env.PORT, 9527);

const config = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  dataSource: String(process.env.DATA_SOURCE || 'json').trim().toLowerCase(),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  questionMaxLength: toNumber(process.env.QUESTION_MAX_LENGTH, 500),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  assetSignSecret: process.env.ASSET_SIGN_SECRET || 'dev-asset-secret-change-me',
  assetSignExpireSeconds: toNumber(process.env.ASSET_SIGN_EXPIRE_SECONDS, 600),
  assetRefreshWindowSeconds: toNumber(process.env.ASSET_REFRESH_WINDOW_SECONDS, 60),
  assetRedirectCacheSeconds: toNumber(process.env.ASSET_REDIRECT_CACHE_SECONDS, 30),
  assetRedirectSharedCacheSeconds: toNumber(process.env.ASSET_REDIRECT_SHARED_CACHE_SECONDS, 60),
  chatKeywordScoreThreshold: toNumber(process.env.CHAT_KEYWORD_SCORE_THRESHOLD, 20),
  chatKeywordStrongThreshold: toNumber(process.env.CHAT_KEYWORD_STRONG_THRESHOLD, 60),
  chatKeywordTopK: toNumber(process.env.CHAT_KEYWORD_TOP_K, 5),
  enableVectorRetrieval: toBoolean(process.env.ENABLE_VECTOR_RETRIEVAL, false),
  chatVectorSimilarityThreshold: toNumber(process.env.CHAT_VECTOR_SIMILARITY_THRESHOLD, 0.2),
  chatVectorMinDomainSimilarity: toNumber(process.env.CHAT_VECTOR_MIN_DOMAIN_SIMILARITY, 0.45),
  chatVectorOnlyAcceptThreshold: toNumber(process.env.CHAT_VECTOR_ONLY_ACCEPT_THRESHOLD, 0.78),
  chatVectorTopK: toNumber(process.env.CHAT_VECTOR_TOP_K, 5),
  chatHybridScoreThreshold: toNumber(process.env.CHAT_HYBRID_SCORE_THRESHOLD, 0.2),
  chatDecisionMinScore: toNumber(process.env.CHAT_DECISION_MIN_SCORE, 0.45),
  chatDecisionMinGap: toNumber(process.env.CHAT_DECISION_MIN_GAP, 0.08),
  chatHybridKeywordWeight: toNumber(process.env.CHAT_HYBRID_KEYWORD_WEIGHT, 0.45),
  chatHybridVectorWeight: toNumber(process.env.CHAT_HYBRID_VECTOR_WEIGHT, 0.55),
  qiniuAccessKey: String(process.env.QINIU_ACCESS_KEY || '').trim(),
  qiniuSecretKey: String(process.env.QINIU_SECRET_KEY || '').trim(),
  qiniuBucket: String(process.env.QINIU_BUCKET || '').trim(),
  qiniuDomain: String(process.env.QINIU_DOMAIN || '').trim().replace(/\/$/, ''),
  qiniuUseHttps: toBoolean(process.env.QINIU_USE_HTTPS, true),
  qiniuPrivateBucket: toBoolean(process.env.QINIU_PRIVATE_BUCKET, true),
  qiniuDownloadExpireSeconds: toNumber(process.env.QINIU_DOWNLOAD_EXPIRE_SECONDS, 600),
  imageSourceMode: String(process.env.IMAGE_SOURCE_MODE || 'object').trim().toLowerCase(),
  localAssetBaseUrl: String(process.env.LOCAL_ASSET_BASE_URL || '').trim().replace(/\/$/, ''),
  embeddingProvider: String(process.env.EMBEDDING_PROVIDER || 'dashscope').trim().toLowerCase(),
  embeddingApiUrl: String(process.env.EMBEDDING_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim(),
  embeddingApiKey: String(process.env.EMBEDDING_API_KEY || String(process.env.DASHSCOPE_API_KEY || '')).trim(),
  embeddingModel: String(process.env.EMBEDDING_MODEL || 'text-embedding-v4').trim(),
  embeddingDim: toNumber(process.env.EMBEDDING_DIM, 1024),
  llmProvider: String(process.env.LLM_PROVIDER || 'dashscope').trim().toLowerCase(),
  llmApiUrl: String(process.env.LLM_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim(),
  llmApiKey: String(
    process.env.LLM_API_KEY
    || process.env.DASHSCOPE_API_KEY
    || process.env.EMBEDDING_API_KEY
    || ''
  ).trim(),
  llmChatModel: String(process.env.LLM_CHAT_MODEL || 'qwen-turbo').trim(),
  enableQuestionNormalize: toBoolean(process.env.ENABLE_QUESTION_NORMALIZE, true),
  enableChatRewrite: toBoolean(process.env.ENABLE_CHAT_REWRITE, true),
  chatEntityMinConfidence: toNumber(process.env.CHAT_ENTITY_MIN_CONFIDENCE, 0.35),
  chatEntityMinGap: toNumber(process.env.CHAT_ENTITY_MIN_GAP, 0.08),
  chatDebugEnabled: toBoolean(process.env.CHAT_DEBUG_ENABLED, process.env.NODE_ENV !== 'production')
};

module.exports = config;
