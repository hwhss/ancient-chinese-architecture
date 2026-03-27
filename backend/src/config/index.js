function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const port = toNumber(process.env.PORT, 9527);

const config = {
  port,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  questionMaxLength: toNumber(process.env.QUESTION_MAX_LENGTH, 500),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${port}`,
  assetSignSecret: process.env.ASSET_SIGN_SECRET || 'dev-asset-secret-change-me',
  assetSignExpireSeconds: toNumber(process.env.ASSET_SIGN_EXPIRE_SECONDS, 600),
  assetRefreshWindowSeconds: toNumber(process.env.ASSET_REFRESH_WINDOW_SECONDS, 60),
  assetRedirectCacheSeconds: toNumber(process.env.ASSET_REDIRECT_CACHE_SECONDS, 30),
  assetRedirectSharedCacheSeconds: toNumber(process.env.ASSET_REDIRECT_SHARED_CACHE_SECONDS, 60)
};

module.exports = config;
