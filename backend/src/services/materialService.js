const fs = require('fs');
const path = require('path');
const {
  getMaterialById,
  getMaterialLinks,
  getBuildingById
} = require('../repositories/dataRepository');
const config = require('../config');
const { verifyAssetOwnership } = require('./assetVerification');
const { getOptimizedSignedUrl } = require('./qiniuService');
const { getLocalImageByMaterialId } = require('../config/localImageMap');

function normalizeImageSourceMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'local' || value === 'object' || value === 'server') {
    return value;
  }
  return 'object';
}

function getImageSourceMode(requester) {
  const fromRequester = normalizeImageSourceMode(requester && requester.imageSource);
  if (fromRequester === 'local' || fromRequester === 'object' || fromRequester === 'server') {
    return fromRequester;
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

function isImageFile(fileName) {
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(String(fileName || ''));
}

function getImageSortWeight(fileName) {
  const value = String(fileName || '').toLowerCase();
  if (value.includes('overview')) return 0;
  if (value.includes('classification')) return 1;
  if (value.includes('structure')) return 2;
  if (value.includes('timeline')) return 3;
  if (value.includes('function')) return 4;
  if (value.includes('infographic')) return 5;
  return 9;
}

function getLocalImageRelativeList(materialId) {
  const primary = String(getLocalImageByMaterialId(materialId) || '').trim().replace(/\\/g, '/');
  if (!primary) {
    return [];
  }

  const relDir = path.posix.dirname(primary);
  const localDir = String(config.localAssetDir || '').trim();
  if (!localDir || !relDir || relDir === '.') {
    return [primary];
  }

  const absDir = path.join(localDir, ...relDir.split('/'));
  if (!fs.existsSync(absDir)) {
    return [primary];
  }

  const files = fs.readdirSync(absDir)
    .filter((name) => isImageFile(name))
    .sort((a, b) => {
      const diff = getImageSortWeight(a) - getImageSortWeight(b);
      return diff !== 0 ? diff : a.localeCompare(b, 'en');
    });

  if (!files.length) {
    return [primary];
  }

  return files.map((name) => `${relDir}/${name}`.replace(/\\/g, '/'));
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
  if (mode === 'local' || mode === 'server') {
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

  const mode = getImageSourceMode(requester);
  const isMappedMode = mode === 'local' || mode === 'server';
  const building = await getBuildingById(materialId);
  const materialRecord = await getMaterialById(materialId);
  const material = materialRecord || {
    materialId,
    url: '',
    type: 'image',
    source: 'fallback-generated'
  };
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

  const localImageRelList = isMappedMode
    ? getLocalImageRelativeList(materialId)
    : [];
  let localImageUrlList = localImageRelList
    .map((rel) => ensureSignedUrl(rel, {}, requester))
    .filter(Boolean);

  const mappedPrimary = localImageRelList.length ? localImageRelList[0] : '';
  const resolvedUrl = isMappedMode
    ? mappedPrimary
    : (String(assetVerification.url || '').trim() || (localImageUrlList[0] || ''));
  const finalVerification = verifyAssetOwnership(resolvedUrl, {
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
    url: isMappedMode
      ? (ensureSignedUrl(resolvedUrl, {}, requester) || '')
      : (ensureSignedUrl(resolvedUrl, {}, requester) || localImageUrlList[0]),
    images: localImageUrlList,
    assetVerification: finalVerification,
    fallbackGenerated: !materialRecord
  };
}

async function listMaterials(query = {}, requester = null) {
  const list = await getMaterialLinks();
  const { type } = query;

  return Promise.all(
    list
      .filter((item) => !type || item.type === type)
      .map(async (item) => {
        const mode = getImageSourceMode(requester);
        const isMappedMode = mode === 'local' || mode === 'server';
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
        const fallbackUrl = isMappedMode
          ? getLocalImageByMaterialId(item.materialId)
          : '';
        const resolvedUrl = isMappedMode
          ? fallbackUrl
          : (String(assetVerification.url || '').trim() || fallbackUrl);

        return {
          ...item,
          url: ensureSignedUrl(resolvedUrl, urlOptions, requester),
          assetVerification
        };
      })
  );
}

module.exports = {
  getMaterial,
  listMaterials
};
