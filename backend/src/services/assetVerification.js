const fs = require('fs');
const path = require('path');

let cachedAliasRules = null;

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[_\-\s]+/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '');
}

function loadAliasRules() {
  if (cachedAliasRules) {
    return cachedAliasRules;
  }

  const filePath = path.join(__dirname, '..', '..', 'data', 'entity_alias_rules.json');
  if (!fs.existsSync(filePath)) {
    cachedAliasRules = [];
    return cachedAliasRules;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    cachedAliasRules = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    cachedAliasRules = [];
  }

  return cachedAliasRules;
}

function extractAssetName(resourceUrl) {
  const rawValue = String(resourceUrl || '').trim();
  if (!rawValue) {
    return '';
  }

  let pathValue = rawValue;
  try {
    const parsed = new URL(rawValue);
    pathValue = parsed.pathname || rawValue;
  } catch (error) {
    pathValue = rawValue;
  }

  const trimmedPath = String(pathValue || '')
    .split('?')[0]
    .split('#')[0]
    .trim();

  const baseName = path.posix.basename(trimmedPath || rawValue);
  if (!baseName) {
    return '';
  }

  try {
    return normalizeToken(decodeURIComponent(baseName));
  } catch (error) {
    return normalizeToken(baseName);
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectEntityTokens(entity = {}) {
  const tokens = new Set();
  const addToken = (value) => {
    const normalized = normalizeToken(value);
    if (normalized) {
      tokens.add(normalized);
    }
  };

  addToken(entity.assetKey);
  addToken(entity.assetName);
  addToken(entity.fileName);
  addToken(entity.imageKey);
  addToken(entity.qiniuKey);
  addToken(entity.id);
  addToken(entity.materialId);
  addToken(entity.name);
  addToken(entity.category);
  addToken(entity.source);
  addToken(entity.location);
  addToken(entity.province);
  addToken(entity.city);
  addToken(entity.description);

  for (const item of toArray(entity.tags)) {
    addToken(item);
  }

  for (const item of toArray(entity.keywords)) {
    addToken(item);
  }

  for (const rule of loadAliasRules()) {
    const aliases = toArray(rule.aliases).map((item) => normalizeToken(item)).filter(Boolean);
    if (!aliases.length) {
      continue;
    }

    const preferredNames = toArray(rule.preferredNames).map((item) => normalizeToken(item)).filter(Boolean);
    const fallbackIds = toArray(rule.fallbackIds).map((item) => normalizeToken(item)).filter(Boolean);
    const matchedByName = Boolean(entity.name) && preferredNames.includes(normalizeToken(entity.name));
    const matchedById = Boolean(entity.id) && fallbackIds.includes(normalizeToken(entity.id));
    const matchedByAlias = Boolean(entity.name) && aliases.includes(normalizeToken(entity.name));

    if (!matchedByName && !matchedById && !matchedByAlias) {
      continue;
    }

    for (const item of aliases) {
      addToken(item);
    }
    for (const item of preferredNames) {
      addToken(item);
    }
    for (const item of fallbackIds) {
      addToken(item);
    }
  }

  return Array.from(tokens);
}

function matchesToken(assetToken, entityToken) {
  if (!assetToken || !entityToken) {
    return false;
  }

  return assetToken === entityToken
    || assetToken.includes(entityToken)
    || entityToken.includes(assetToken);
}

function verifyAssetOwnership(resourceUrl, entity = {}, options = {}) {
  const kind = String(options.kind || 'asset').trim() || 'asset';
  const expectedTokens = collectEntityTokens(entity);
  const explicitOwnerId = normalizeToken(options.explicitOwnerId || '');
  const trustExplicitBinding = Boolean(options.trustExplicitBinding);
  const safeResourceUrl = String(resourceUrl || '').trim();
  const assetName = normalizeToken(
    extractAssetName(resourceUrl)
    || entity.assetKey
    || entity.assetName
    || entity.fileName
    || entity.imageKey
    || entity.qiniuKey
  );

  const matchedToken = expectedTokens.find((token) => matchesToken(assetName, token));
  const matchedByName = Boolean(assetName) && Boolean(matchedToken);
  const matchedByBinding = Boolean(safeResourceUrl) && trustExplicitBinding && Boolean(explicitOwnerId);
  const verified = matchedByName || matchedByBinding;
  const reason = matchedByName
    ? 'asset_name_match'
    : (matchedByBinding
      ? 'explicit_owner_binding'
      : (!assetName ? 'missing_asset_name' : 'asset_name_mismatch'));

  return {
    kind,
    verified,
    assetName: assetName || '',
    matchedToken: matchedToken || explicitOwnerId || '',
    expectedTokens,
    reason,
    url: verified ? safeResourceUrl : ''
  };
}

module.exports = {
  verifyAssetOwnership,
  extractAssetName,
  normalizeToken
};