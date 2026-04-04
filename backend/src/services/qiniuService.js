const axios = require('axios');
const crypto = require('crypto');

const config = require('../config');

function validateQiniuConfig() {
  if (!config.qiniuAccessKey || !config.qiniuSecretKey || !config.qiniuBucket) {
    throw new Error('七牛配置不完整，请检查 QINIU_ACCESS_KEY/QINIU_SECRET_KEY/QINIU_BUCKET');
  }
}

function normalizeKey(key) {
  return String(key || '').trim().replace(/^\/+/, '');
}

function toUrlSafeBase64(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

function buildPrivateDownloadUrl(publicUrl, expiresSeconds) {
  const deadline = Math.floor(Date.now() / 1000) + expiresSeconds;
  const separator = publicUrl.includes('?') ? '&' : '?';
  const signedUrl = `${publicUrl}${separator}e=${deadline}`;
  const sign = crypto.createHmac('sha1', config.qiniuSecretKey).update(signedUrl).digest();
  const encodedSign = toUrlSafeBase64(sign);
  const token = `${config.qiniuAccessKey}:${encodedSign}`;
  return `${signedUrl}&token=${token}`;
}

function resolveQiniuDomain() {
  const raw = String(config.qiniuDomain || '').trim();
  if (raw) {
    return raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // 七牛未配置自定义域名时，默认使用 bucket 对应的公开域名。
  return `${config.qiniuBucket}.qiniudn.com`;
}

function getSignedDownloadUrl(key, expiresSeconds = config.qiniuDownloadExpireSeconds, options = {}) {
  validateQiniuConfig();

  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) {
    throw new Error('key不能为空');
  }

  const safeExpires = Number.isFinite(Number(expiresSeconds))
    ? Math.max(1, Number(expiresSeconds))
    : config.qiniuDownloadExpireSeconds;

  const protocol = config.qiniuUseHttps ? 'https' : 'http';
  const domain = resolveQiniuDomain();
  
  // 处理图片样式（如果提供了 options）
  const processQuery = buildImageProcessQuery(options);
  let urlPath = encodeURI(normalizedKey);
  if (processQuery) {
    urlPath += (urlPath.includes('?') ? '&' : '?') + processQuery;
  }

  const publicUrl = `${protocol}://${domain}/${urlPath}`;

  if (!config.qiniuPrivateBucket) {
    return {
      url: publicUrl,
      key: normalizedKey,
      expiresIn: null
    };
  }

  const signedUrl = buildPrivateDownloadUrl(publicUrl, safeExpires);

  return {
    url: signedUrl,
    key: normalizedKey,
    expiresIn: safeExpires
  };
}

/**
 * 获取优化后的图片链接（默认 WebP/瘦身/限制质量）
 * 此方法不会发起网络请求，仅根据七牛规则生成签名链接
 */
function getOptimizedSignedUrl(key, options = {}) {
  const defaultOptions = {
    quality: 75,
    ...options
  };
  return getSignedDownloadUrl(key, config.qiniuDownloadExpireSeconds, defaultOptions);
}

async function fetchObjectFromQiniu(key) {
  const signed = getSignedDownloadUrl(key);
  const response = await axios.get(signed.url, {
    responseType: 'arraybuffer',
    validateStatus(status) {
      return status >= 200 && status < 300;
    }
  });

  const buffer = Buffer.from(response.data);
  const contentType = String(response.headers['content-type'] || '').toLowerCase();
  const text = buffer.toString('utf8');

  let json = null;
  if (contentType.includes('application/json')) {
    json = JSON.parse(text);
  } else {
    try {
      json = JSON.parse(text);
    } catch (error) {
      json = null;
    }
  }

  return {
    key: signed.key,
    url: signed.url,
    expiresIn: signed.expiresIn,
    contentType: contentType || null,
    etag: response.headers.etag || null,
    size: buffer.length,
    text,
    json
  };
}

function buildImageProcessQuery(options = {}) {
  const width = Number(options.width);
  const height = Number(options.height);
  const quality = Number(options.quality);

  const safeWidth = Number.isFinite(width) && width > 0 ? Math.min(Math.floor(width), 2000) : null;
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.min(Math.floor(height), 2000) : null;
  const safeQuality = Number.isFinite(quality) && quality > 0 ? Math.min(Math.floor(quality), 100) : null;

  if (!safeWidth && !safeHeight && !safeQuality) {
    return '';
  }

  const segments = ['imageView2/2'];
  if (safeWidth) {
    segments.push(`w/${safeWidth}`);
  }
  if (safeHeight) {
    segments.push(`h/${safeHeight}`);
  }
  if (safeQuality) {
    segments.push(`q/${safeQuality}`);
  }

  return segments.join('/');
}

async function fetchBinaryFromQiniu(key, options = {}) {
  const processQuery = buildImageProcessQuery(options);
  const signed = getSignedDownloadUrl(
    key, config.qiniuDownloadExpireSeconds, options
  );
  const response = await axios.get(signed.url, {
    responseType: 'arraybuffer',
    validateStatus(status) {
      return status >= 200 && status < 300;
    }
  });

  return {
    key: signed.key,
    url: signed.url,
    expiresIn: signed.expiresIn,
    contentType: String(response.headers['content-type'] || 'application/octet-stream'),
    etag: response.headers.etag || null,
    cacheControl: response.headers['cache-control'] || null,
    body: Buffer.from(response.data)
  };
}

module.exports = {
  getSignedDownloadUrl,
  getOptimizedSignedUrl,
  fetchObjectFromQiniu,
  fetchBinaryFromQiniu
};
