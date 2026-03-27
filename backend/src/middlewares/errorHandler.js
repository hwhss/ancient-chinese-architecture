const { sendError } = require('../utils/response');

function notFoundHandler(req, res) {
  return sendError(res, 404, '接口不存在');
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err.message);
  return sendError(res, 500, '服务异常，请重试');
}

module.exports = {
  notFoundHandler,
  errorHandler
};
