function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = {
  port: toNumber(process.env.PORT, 9527),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  questionMaxLength: toNumber(process.env.QUESTION_MAX_LENGTH, 500)
};

module.exports = config;
