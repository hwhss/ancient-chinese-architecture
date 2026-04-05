const {
  getMaterialById,
  getMaterialLinks,
  getBuildingById
} = require('../repositories/dataRepository');
const config = require('../config');
const { verifyAssetOwnership } = require('./assetVerification');
const { getOptimizedSignedUrl } = require('./qiniuService');

function normalizeImageSourceMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  return value === 'local' ? 'local' : 'object';
}

function getImageSourceMode(requester) {
  if (requester && requester.imageSource) {
    return normalizeImageSourceMode(requester.imageSource);
  }
  return normalizeImageSourceMode(config.imageSourceMode);
}

function buildLocalAssetUrl(value) {
  const localBase = String(config.localAssetBaseUrl || '').trim().replace(/\/$/, '');
  if (!localBase) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const key = String(parsed.pathname || '').replace(/^\/+/, '');
      if (!key) {
        return value;
      }
      return `${localBase}/${key}`;
    } catch (error) {
      return value;
    }
  }

  return `${localBase}/${String(value).replace(/^\/+/, '')}`;
}

/**
 * 确保返回的是可直接访问的签名 URL。
 * 如果输入已经是 http(s) 开头，则原样返回；否则视为七牛 Key 进行签名。
 */
function ensureSignedUrl(url, options = {}, requester = null) {
  const value = String(url || '').trim();
  if (!value) {
    return '';
  }

  const mode = getImageSourceMode(requester);
  if (mode === 'local') {
    return buildLocalAssetUrl(value);
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // 视为七牛 Key，生成签名且优化的链接
  try {
    return getOptimizedSignedUrl(value, options).url;
  } catch (error) {
    console.warn(`[materialService] 签名 URL 失败: ${value}`, error.message);
    return value;
  }
}

async function getMaterial(materialId, requester = null) {
  if (!materialId) {
    return null;
  }

  const material = await getMaterialById(materialId);
  if (!material) {
    return null;
  }

  const building = await getBuildingById(materialId);
  const assetVerification = verifyAssetOwnership(material.url, {
    id: building && building.id ? building.id : materialId,
    materialId,
    name: building && building.name ? building.name : materialId,
    category: building && building.category ? building.category : '',
    tags: building && Array.isArray(building.tags) ? building.tags : [],
    keywords: building && Array.isArray(building.tags) ? building.tags : [],
    source: material.source || '',
    location: building && building.location ? building.location : '',
    province: building && building.province ? building.province : '',
    city: building && building.city ? building.city : ''
  }, {
    kind: 'material',
    trustExplicitBinding: true,
    explicitOwnerId: materialId
  });

  return {
    ...material,
    url: ensureSignedUrl(assetVerification.url, {}, requester),
    assetVerification
  };
}

async function listMaterials(query = {}, requester = null) {
  const list = await getMaterialLinks();
  const { type } = query;

  return Promise.all(
    list
      .filter((item) => !type || item.type === type)
      .map(async (item) => {
        const building = item.materialId ? await getBuildingById(item.materialId) : null;
        const assetVerification = verifyAssetOwnership(item.url, {
          id: building && building.id ? building.id : item.materialId,
          materialId: item.materialId,
          name: building && building.name ? building.name : item.materialId,
          category: building && building.category ? building.category : '',
          tags: building && Array.isArray(building.tags) ? building.tags : [],
          keywords: building && Array.isArray(building.tags) ? building.tags : [],
          source: item.source || '',
          location: building && building.location ? building.location : '',
          province: building && building.province ? building.province : '',
          city: building && building.city ? building.city : ''
        }, {
          kind: 'material',
          trustExplicitBinding: true,
          explicitOwnerId: item.materialId
        });

        // 列表页使用缩略图优化
        const urlOptions = item.type === 'image' ? { width: 400, quality: 60 } : {};

        return {
          ...item,
          url: ensureSignedUrl(assetVerification.url, urlOptions, requester),
          assetVerification
        };
      })
  );
}

module.exports = {
  getMaterial,
  listMaterials
};
