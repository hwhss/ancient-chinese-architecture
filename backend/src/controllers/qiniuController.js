const { sendSuccess, sendError } = require('../utils/response');
const { getSignedDownloadUrl, fetchObjectFromQiniu, fetchBinaryFromQiniu } = require('../services/qiniuService');

function parseExpireSeconds(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function getQiniuDownloadUrl(req, res, next) {
  try {
    const key = String(req.query.key || '').trim();
    if (!key) {
      return sendError(res, 400, 'key不能为空');
    }

    const expiresSeconds = parseExpireSeconds(req.query.expiresSeconds);
    const result = getSignedDownloadUrl(key, expiresSeconds);
    return sendSuccess(res, result);
  } catch (error) {
    if (error && error.message) {
      return sendError(res, 400, error.message);
    }
    return next(error);
  }
}

async function getQiniuObject(req, res, next) {
  try {
    const key = String(req.query.key || '').trim();
    if (!key) {
      return sendError(res, 400, 'key不能为空');
    }

    const result = await fetchObjectFromQiniu(key);
    const mode = String(req.query.mode || 'auto').trim().toLowerCase();

    if (mode === 'json') {
      if (result.json === null) {
        return sendError(res, 422, '对象内容不是合法JSON');
      }
      return sendSuccess(res, {
        key: result.key,
        contentType: result.contentType,
        size: result.size,
        etag: result.etag,
        data: result.json
      });
    }

    if (mode === 'text') {
      return sendSuccess(res, {
        key: result.key,
        contentType: result.contentType,
        size: result.size,
        etag: result.etag,
        data: result.text
      });
    }

    return sendSuccess(res, {
      key: result.key,
      contentType: result.contentType,
      size: result.size,
      etag: result.etag,
      data: result.json !== null ? result.json : result.text
    });
  } catch (error) {
    if (error && error.response && error.response.status === 404) {
      return sendError(res, 404, '七牛对象不存在');
    }

    if (error && error.response && error.response.status === 401) {
      return sendError(res, 401, '七牛鉴权失败，请检查密钥配置');
    }

    if (error && error.message) {
      return sendError(res, 400, error.message);
    }

    return next(error);
  }
}

async function getQiniuImage(req, res, next) {
  try {
    const key = String(req.query.key || '').trim();
    if (!key) {
      return sendError(res, 400, 'key不能为空');
    }

    const width = Number(req.query.w || req.query.width);
    const height = Number(req.query.h || req.query.height);
    const quality = Number(req.query.q || req.query.quality);

    // 生成签名且优化的直连 URL
    const result = getSignedDownloadUrl(key, undefined, {
      width,
      height,
      quality
    });

    // 使用 302 重定向到七牛 CDN，减少后端带宽和延迟
    return res.redirect(302, result.url);
  } catch (error) {
    if (error && error.message) {
      return sendError(res, 400, error.message);
    }

    return next(error);
  }
}

module.exports = {
  getQiniuDownloadUrl,
  getQiniuObject,
  getQiniuImage
};
