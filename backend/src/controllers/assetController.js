const { sendError } = require('../utils/response');
const config = require('../config');
const {
  verifySignedToken,
  parseSignedToken,
  buildSignedAssetUrl
} = require('../utils/signedAsset');

function getRequester(req) {
  return {
    userId: String(req.headers['x-user-id'] || req.headers['x-user'] || 'anonymous').trim(),
    role: String(req.headers['x-user-role'] || 'viewer').trim().toLowerCase(),
    ip: String(req.ip || '').trim(),
    userAgent: String(req.headers['user-agent'] || '').trim()
  };
}

function parseTokenFromReq(req) {
  const tokenQuery = String(req.query.token || '').trim();
  if (tokenQuery) {
    return tokenQuery;
  }

  const auth = String(req.headers.authorization || '').trim();
  if (/^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, '').trim();
  }

  return '';
}

function setRedirectCacheHeaders(res) {
  const maxAge = Math.max(0, Number(config.assetRedirectCacheSeconds) || 0);
  const sharedMaxAge = Math.max(maxAge, Number(config.assetRedirectSharedCacheSeconds) || 0);
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sharedMaxAge}, stale-while-revalidate=30`);
  res.setHeader('Vary', 'User-Agent, X-Forwarded-For');
}

function getResponseBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return String(config.publicBaseUrl).replace(/\/$/, '');
  }

  const host = String(req.get('host') || '').trim();
  if (!host) {
    return String(config.publicBaseUrl).replace(/\/$/, '');
  }

  return `${req.protocol}://${host}`.replace(/\/$/, '');
}

function getSignedAsset(req, res) {
  const token = parseTokenFromReq(req);
  if (!token) {
    return sendError(res, 400, '缺少token参数');
  }

  const requester = getRequester(req);
  const verified = verifySignedToken(token, config.assetSignSecret, {
    ip: requester.ip,
    userAgent: requester.userAgent
  });
  if (!verified.ok) {
    return sendError(res, 401, verified.message || '签名校验失败');
  }

  const resourceUrl = verified.payload && verified.payload.resourceUrl;
  if (!resourceUrl) {
    return sendError(res, 400, '资源地址无效');
  }

  setRedirectCacheHeaders(res);
  return res.redirect(302, resourceUrl);
}

function refreshSignedAsset(req, res) {
  const token = parseTokenFromReq(req);
  if (!token) {
    return sendError(res, 400, '缺少token参数');
  }

  const requester = getRequester(req);
  const verified = verifySignedToken(token, config.assetSignSecret, {
    ip: requester.ip,
    userAgent: requester.userAgent
  });
  if (!verified.ok) {
    return sendError(res, 401, verified.message || '签名校验失败');
  }

  const oldPayload = parseSignedToken(token);
  if (!oldPayload || !oldPayload.resourceUrl || !oldPayload.buildingId) {
    return sendError(res, 400, '原token载荷无效');
  }

  const requesterUserId = requester.userId || 'anonymous';
  const requesterRole = requester.role || 'viewer';
  if (oldPayload.userId && oldPayload.userId !== requesterUserId) {
    return sendError(res, 403, 'token所属用户不匹配');
  }
  if (oldPayload.role && oldPayload.role !== requesterRole) {
    return sendError(res, 403, 'token所属角色不匹配');
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = Math.max(0, Number(oldPayload.exp || 0) - now);
  if (secondsLeft > Math.max(5, config.assetRefreshWindowSeconds)) {
    const baseUrl = getResponseBaseUrl(req);
    return res.status(200).json({
      code: 200,
      msg: 'token仍然有效，无需续期',
      data: {
        shouldRefresh: false,
        secondsLeft,
        signedUrl: `${baseUrl}/api/assets/signed?token=${encodeURIComponent(token)}`,
        expiresAt: new Date(Number(oldPayload.exp) * 1000).toISOString(),
        token
      }
    });
  }

  const responseBaseUrl = getResponseBaseUrl(req);

  const refreshed = buildSignedAssetUrl({
    resourceUrl: oldPayload.resourceUrl,
    buildingId: oldPayload.buildingId,
    version: oldPayload.version,
    userId: requesterUserId,
    role: requesterRole,
    bindIp: requester.ip,
    userAgent: requester.userAgent,
    expireSeconds: config.assetSignExpireSeconds,
    secret: config.assetSignSecret,
    publicBaseUrl: responseBaseUrl
  });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    code: 200,
    msg: 'success',
    data: {
      shouldRefresh: true,
      secondsLeft,
      signedUrl: refreshed.signedUrl,
      expiresAt: refreshed.expiresAt,
      token: refreshed.token
    }
  });
}

module.exports = {
  getSignedAsset,
  refreshSignedAsset
};
