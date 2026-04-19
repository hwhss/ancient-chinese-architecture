const crypto = require('crypto');

function normalizeIp(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) {
    return '';
  }

  const first = text.split(',')[0].trim();
  const noZone = first.replace(/%.+$/, '');

  if (noZone === '::1' || noZone === '127.0.0.1' || noZone === 'localhost') {
    return 'loopback';
  }

  if (noZone.startsWith('::ffff:')) {
    const mappedIpv4 = noZone.slice('::ffff:'.length);
    if (mappedIpv4 === '127.0.0.1') {
      return 'loopback';
    }
    return mappedIpv4;
  }

  return noZone;
}

function hashText(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function signPayload(payloadBase64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
}

function createSignedToken(payload, secret) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

function parseSignedToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  } catch (error) {
    return null;
  }
}

function verifySignedToken(token, secret, context = {}) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, message: '签名令牌无效' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { ok: false, message: '签名令牌格式错误' };
  }

  const payloadBase64 = parts[0];
  const signature = parts[1];
  const expected = signPayload(payloadBase64, secret);

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return { ok: false, message: '签名校验失败' };
  }

  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return { ok: false, message: '签名校验失败' };
  }

  let payload = null;
  try {
    payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch (error) {
    return { ok: false, message: '签名载荷解析失败' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    return { ok: false, message: '签名已过期' };
  }

  const requestIp = String(context.ip || '').trim();
  const requestUserAgent = String(context.userAgent || '').trim();

  const payloadIp = normalizeIp(payload.bindIp);
  const currentIp = normalizeIp(requestIp);
  if (payloadIp && currentIp && payloadIp !== currentIp) {
    return { ok: false, message: '签名使用环境不匹配(IP)' };
  }

  if (payload.bindUaHash && requestUserAgent) {
    const currentHash = hashText(requestUserAgent);
    if (payload.bindUaHash !== currentHash) {
      return { ok: false, message: '签名使用环境不匹配(UA)' };
    }
  }

  return { ok: true, payload };
}

function buildSignedAssetUrl(options) {
  const {
    resourceUrl,
    buildingId,
    version,
    userId,
    role,
    bindIp,
    userAgent,
    expireSeconds,
    secret,
    publicBaseUrl
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + Math.max(60, Number(expireSeconds) || 600);
  const payload = {
    resourceUrl,
    buildingId,
    version,
    userId,
    role,
    bindIp: normalizeIp(bindIp),
    bindUaHash: userAgent ? hashText(userAgent) : '',
    exp
  };

  const token = createSignedToken(payload, secret);
  const signedUrl = `${String(publicBaseUrl).replace(/\/$/, '')}/api/assets/signed?token=${encodeURIComponent(token)}`;

  return {
    token,
    signedUrl,
    expiresAt: new Date(exp * 1000).toISOString()
  };
}

module.exports = {
  buildSignedAssetUrl,
  verifySignedToken,
  parseSignedToken
};
