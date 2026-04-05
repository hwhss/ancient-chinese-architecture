const {
  getBuildings,
  getBuildingById,
  getBuildingProfileById
} = require('../repositories/dataRepository');
const config = require('../config');
const { buildSignedAssetUrl } = require('../utils/signedAsset');
const { verifyAssetOwnership } = require('./assetVerification');
const { getOptimizedSignedUrl } = require('./qiniuService');

function normalizeImageSourceMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  return value === 'local' ? 'local' : 'object';
}

function getImageSourceMode(requester) {
  const fromRequester = normalizeImageSourceMode(requester && requester.imageSource);
  if (requester && requester.imageSource) {
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

/**
 * 确保返回的是可直接访问的签名 URL。
 * 处理逻辑同 materialService。
 */
function ensureSignedUrl(url, options = {}, requester = null) {
  const value = String(url || '').trim();
  if (!value) {
    return value;
  }

  const mode = getImageSourceMode(requester);
  if (mode === 'local') {
    return buildLocalAssetUrl(value);
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  try {
    return getOptimizedSignedUrl(value, options).url;
  } catch (error) {
    return value;
  }
}

const CATEGORY_TEXT_MAP = {
  palace: '皇宫',
  bridge: '桥梁',
  garden: '园林',
  defense: '城防',
  residence: '民居',
  tower: '楼阁',
  water: '水利'
};

function getCategoryText(category) {
  return CATEGORY_TEXT_MAP[category] || '未分类';
}

function buildVisualizationMeta(item) {
  const lat = Number.isFinite(Number(item.lat)) ? Number(item.lat) : null;
  const lng = Number.isFinite(Number(item.lng)) ? Number(item.lng) : null;
  const mainEraStart = Number.isFinite(Number(item.mainEraStart)) ? Number(item.mainEraStart) : null;
  const mainEraEnd = Number.isFinite(Number(item.mainEraEnd)) ? Number(item.mainEraEnd) : null;

  return {
    province: String(item.province || '').trim(),
    city: String(item.city || '').trim(),
    coordinates: {
      lat,
      lng
    },
    heritageLevel: String(item.heritageLevel || 'unknown').trim() || 'unknown',
    openStatus: String(item.openStatus || 'unknown').trim() || 'unknown',
    mainEra: {
      start: mainEraStart,
      end: mainEraEnd
    }
  };
}

function buildBuildingAssetVerification(item) {
  return verifyAssetOwnership(item.image, {
    id: item.id,
    name: item.name,
    category: item.category,
    tags: item.tags || [],
    keywords: item.tags || [],
    location: item.location,
    province: item.province,
    city: item.city,
    description: item.description,
    assetKey: item.assetKey,
    assetName: item.assetName,
    fileName: item.fileName,
    imageKey: item.imageKey,
    qiniuKey: item.qiniuKey
  }, {
    kind: 'building',
    trustExplicitBinding: true,
    explicitOwnerId: item.id
  });
}

function buildListThumbnailUrl(resourceUrl, requester) {
  // 列表页使用 480 宽度的缩略图
  return ensureSignedUrl(resourceUrl, { width: 480, quality: 75 }, requester);
}

function buildModel3d(profile, fallbackPoster, requester) {
  const model3d = profile && profile.model3d ? profile.model3d : null;
  if (!model3d) {
    return {
      status: 'none',
      canView: false,
      viewerType: 'model-viewer',
      modelUrl: '',
      poster: fallbackPoster || '',
      note: '暂无3D模型'
    };
  }

  const hasVersionModel = Array.isArray(model3d.versions)
    && model3d.versions.some((item) => item && item.modelUrl);
  const fallbackModelUrl = model3d.modelUrl
    || (hasVersionModel ? model3d.versions.find((item) => item && item.modelUrl).modelUrl : '');

  const canView = Boolean(fallbackModelUrl) && (model3d.status === 'ready' || model3d.status === 'demo');
  const posterUrl = model3d.poster || fallbackPoster || '';

  return {
    status: model3d.status || 'planned',
    canView,
    viewerType: model3d.viewerType || 'model-viewer',
    modelUrl: fallbackModelUrl,
    poster: ensureSignedUrl(posterUrl, { quality: 85 }, requester),
    note: model3d.note || ''
  };
}

function normalizeModelVersions(model3d) {
  if (!model3d) {
    return [];
  }

  if (Array.isArray(model3d.versions) && model3d.versions.length) {
    return model3d.versions.map((item, index) => ({
      version: item.version || `v${index + 1}`,
      label: item.label || `版本 ${index + 1}`,
      modelUrl: item.modelUrl || '',
      format: item.format || model3d.format || 'glb',
      allowedRoles: Array.isArray(item.allowedRoles) && item.allowedRoles.length
        ? item.allowedRoles
        : ['viewer', 'admin'],
      draco: Boolean(item.draco),
      ktx2: Boolean(item.ktx2),
      lod: Array.isArray(item.lod) ? item.lod : [],
      preload: item.preload || null,
      hotspots: Array.isArray(item.hotspots) ? item.hotspots : [],
      camera: item.camera || null
    }));
  }

  if (model3d.modelUrl) {
    return [{
      version: model3d.version || 'v1',
      label: model3d.label || '默认版本',
      modelUrl: model3d.modelUrl,
      format: model3d.format || 'glb',
      allowedRoles: Array.isArray(model3d.allowedRoles) && model3d.allowedRoles.length
        ? model3d.allowedRoles
        : ['viewer', 'admin'],
      draco: Boolean(model3d.draco),
      ktx2: Boolean(model3d.ktx2),
      lod: Array.isArray(model3d.lod) ? model3d.lod : [],
      preload: model3d.preload || null,
      hotspots: Array.isArray(model3d.hotspots) ? model3d.hotspots : [],
      camera: model3d.camera || null
    }];
  }

  return [];
}

function normalizeRequester(requester) {
  const role = String(requester && requester.role ? requester.role : 'viewer').trim().toLowerCase();
  return {
    userId: String(requester && requester.userId ? requester.userId : 'anonymous').trim(),
    role: role || 'viewer',
    ip: String(requester && requester.ip ? requester.ip : '').trim(),
    userAgent: String(requester && requester.userAgent ? requester.userAgent : '').trim(),
    requestBaseUrl: String(requester && requester.requestBaseUrl ? requester.requestBaseUrl : '').trim().replace(/\/$/, '')
  };
}

function getSigningBaseUrl(requester) {
  const safeRequester = normalizeRequester(requester || {});
  return safeRequester.requestBaseUrl || String(config.publicBaseUrl || '').trim().replace(/\/$/, '');
}

function canRequesterAccessVersion(requester, versionItem) {
  const safeRequester = normalizeRequester(requester);
  const roles = Array.isArray(versionItem.allowedRoles) && versionItem.allowedRoles.length
    ? versionItem.allowedRoles.map((item) => String(item).toLowerCase())
    : ['viewer', 'admin'];
  return roles.includes(safeRequester.role);
}

function buildSignedLodArray(lodArray, buildingId, version, requester) {
  if (!Array.isArray(lodArray) || lodArray.length === 0) {
    return [];
  }

  const safeRequester = normalizeRequester(requester || {});
  const signingBaseUrl = getSigningBaseUrl(safeRequester);

  return lodArray.map((item) => {
    const rawResourceUrl = String((item && (item.modelUrl || item.url)) || '').trim();
    if (!item || !rawResourceUrl) {
      return item;
    }

    const signed = buildSignedAssetUrl({
      resourceUrl: rawResourceUrl,
      buildingId,
      version: `${version}-lod${Number(item.level) || 0}`,
      userId: safeRequester.userId,
      role: safeRequester.role,
      bindIp: safeRequester.ip,
      userAgent: safeRequester.userAgent,
      expireSeconds: config.assetSignExpireSeconds,
      secret: config.assetSignSecret,
      publicBaseUrl: signingBaseUrl
    });

    return {
      ...item,
      modelUrl: signed.signedUrl,
      url: signed.signedUrl,
      signedUrl: signed.signedUrl,
      expiresAt: signed.expiresAt
    };
  });
}

function buildSignedVersion(versionItem, buildingId, requester) {
  const safeRequester = normalizeRequester(requester);
  const signingBaseUrl = getSigningBaseUrl(safeRequester);

  if (!versionItem.modelUrl) {
    return {
      ...versionItem,
      modelUrl: '',
      signedUrl: '',
      expiresAt: ''
    };
  }

  const signed = buildSignedAssetUrl({
    resourceUrl: versionItem.modelUrl,
    buildingId,
    version: versionItem.version,
    userId: safeRequester.userId,
    role: safeRequester.role,
    bindIp: safeRequester.ip,
    userAgent: safeRequester.userAgent,
    expireSeconds: config.assetSignExpireSeconds,
    secret: config.assetSignSecret,
    publicBaseUrl: signingBaseUrl
  });

  return {
    ...versionItem,
    modelUrl: signed.signedUrl,
    signedUrl: signed.signedUrl,
    expiresAt: signed.expiresAt
  };
}

function buildPreloadInfo(model3d, defaultVersion, buildingId, requester) {
  const preloadFromModel = model3d && model3d.preload ? model3d.preload : {};
  const preloadFromVersion = defaultVersion && defaultVersion.preload ? defaultVersion.preload : {};
  const signingBaseUrl = getSigningBaseUrl(requester);

  const lod0Item = defaultVersion && Array.isArray(defaultVersion.lod)
    ? defaultVersion.lod.find((item) => item && Number(item.level) === 0 && (item.modelUrl || item.url))
    : null;

  let lod0ModelUrl = preloadFromVersion.lod0ModelUrl
    || preloadFromModel.lod0ModelUrl
    || (lod0Item ? (lod0Item.modelUrl || lod0Item.url) : '');

  let lod0ExpiresAt = '';

  // 对 LOD0 URL 签名
  if (lod0ModelUrl && defaultVersion && defaultVersion.version) {
    const safeRequester = normalizeRequester(requester || {});
    const signed = buildSignedAssetUrl({
      resourceUrl: lod0ModelUrl,
      buildingId,
      version: `${defaultVersion.version}-lod0`,
      userId: safeRequester.userId,
      role: safeRequester.role,
      bindIp: safeRequester.ip,
      userAgent: safeRequester.userAgent,
      expireSeconds: config.assetSignExpireSeconds,
      secret: config.assetSignSecret,
      publicBaseUrl: signingBaseUrl
    });
    lod0ModelUrl = signed.signedUrl;
    lod0ExpiresAt = signed.expiresAt;
  }

  const panoramaUrl = preloadFromVersion.panoramaUrl
    || preloadFromModel.panoramaUrl
    || '';

  const placeholderType = lod0ModelUrl
    ? 'lod0-model'
    : (panoramaUrl ? 'panorama' : 'poster');

  return {
    placeholderType,
    lod0ModelUrl,
    lod0ExpiresAt,
    panoramaUrl,
    posterBlur: preloadFromVersion.posterBlur || preloadFromModel.posterBlur || '',
    swapMode: preloadFromVersion.swapMode || preloadFromModel.swapMode || 'replace-on-ready',
    uiHint: preloadFromVersion.uiHint || preloadFromModel.uiHint || '先展示轻量占位资源，再无缝切换高清模型'
  };
}

function buildBuildingSummary(item, requester) {
  return getBuildingProfileById(item.id).then((profile) => {
    const safeProfile = profile || {};
    const assetVerification = buildBuildingAssetVerification(item);
    const rawImage = assetVerification.verified ? assetVerification.url : '';
    const safeImage = ensureSignedUrl(rawImage, { quality: 85 }, requester);
    const listImage = buildListThumbnailUrl(rawImage, requester);
    const model3d = buildModel3d(safeProfile, listImage, requester);
    const visualization = buildVisualizationMeta(item);

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      categoryText: getCategoryText(item.category),
      location: item.location,
      province: visualization.province,
      city: visualization.city,
      coordinates: visualization.coordinates,
      heritageLevel: visualization.heritageLevel,
      openStatus: visualization.openStatus,
      mainEra: visualization.mainEra,
      image: listImage,
      coverImage: listImage,
      originalImage: safeImage,
      tags: item.tags || [],
      overviewSummary: safeProfile.overviewSummary || item.description || '',
      has3d: model3d.canView,
      model3dStatus: model3d.status,
      assetVerification
    };
  });
}

async function buildBuildingDetail(item, requester) {
  const profile = await getBuildingProfileById(item.id) || {};
  const assetVerification = buildBuildingAssetVerification(item);
  const rawImage = assetVerification.verified ? assetVerification.url : '';
  // 详情页主图，设置较大尺寸和较好质量
  const safeImage = ensureSignedUrl(rawImage, { width: 1200, quality: 85 }, requester);
  const model3d = buildModel3d(profile, safeImage, requester);
  const visualization = buildVisualizationMeta(item);

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    categoryText: getCategoryText(item.category),
    location: item.location,
    province: visualization.province,
    city: visualization.city,
    coordinates: visualization.coordinates,
    heritageLevel: visualization.heritageLevel,
    openStatus: visualization.openStatus,
    mainEra: visualization.mainEra,
    description: item.description,
    image: safeImage,
    tags: item.tags || [],
    overview: {
      summary: profile.overviewSummary || item.description || '',
      era: profile.era || '待补充',
      style: profile.style || '待补充',
      keyPoints: profile.keyPoints || []
    },
    history: profile.history || item.description || '暂无详细历史信息',
    architectureHighlights: profile.architectureHighlights || [],
    culturalValue: profile.culturalValue || '暂无补充说明',
    model3d,
    assetVerification
  };
}

async function listBuildings(query = {}, requester = null) {
  const allBuildings = await getBuildings();
  const { category, q } = query;

  const filtered = allBuildings.filter((item) => {
    const categoryMatched = !category || category === 'all' || item.category === category;

    if (!categoryMatched) {
      return false;
    }

    if (!q) {
      return true;
    }

    const text = `${item.name} ${item.location} ${(item.tags || []).join(' ')} ${item.description}`.toLowerCase();
    return text.includes(String(q).toLowerCase());
  });

  return Promise.all(filtered.map((item) => buildBuildingSummary(item, requester)));
}

async function getBuilding(id, requester = null) {
  const item = await getBuildingById(id);
  if (!item) {
    return null;
  }
  return buildBuildingDetail(item, requester);
}

async function getBuildingModel3d(id, requester) {
  const item = await getBuildingById(id);
  if (!item) {
    return null;
  }

  const profile = await getBuildingProfileById(id) || {};
  const versions = normalizeModelVersions(profile.model3d || null);
  const filteredVersions = versions.filter((versionItem) => canRequesterAccessVersion(requester, versionItem));
  const signedVersions = filteredVersions.map((versionItem) => buildSignedVersion(versionItem, id, requester));
  const defaultVersion = signedVersions[0] || null;

  return {
    buildingId: id,
    buildingName: item.name,
    ...buildModel3d(profile, item.image),
    activeVersion: defaultVersion ? defaultVersion.version : '',
    versions: signedVersions.map((itemVersion) => ({
      version: itemVersion.version,
      label: itemVersion.label,
      format: itemVersion.format,
      signedUrl: itemVersion.signedUrl,
      expiresAt: itemVersion.expiresAt
    }))
  };
}

async function getBuildingModel3dManifest(id, requester) {
  const item = await getBuildingById(id);
  if (!item) {
    return null;
  }

  const profile = await getBuildingProfileById(id) || {};
  const model3d = buildModel3d(profile, item.image, requester);
  const versions = normalizeModelVersions(profile.model3d || null)
    .filter((versionItem) => canRequesterAccessVersion(requester, versionItem))
    .map((versionItem) => buildSignedVersion(versionItem, id, requester));
  const versionSummaries = versions.map((versionItem) => ({
    version: versionItem.version,
    label: versionItem.label,
    format: versionItem.format,
    signedUrl: versionItem.signedUrl,
    expiresAt: versionItem.expiresAt,
    draco: Boolean(versionItem.draco),
    ktx2: Boolean(versionItem.ktx2)
  }));
  const defaultVersion = versions[0] || null;
  const hotspots = defaultVersion && Array.isArray(defaultVersion.hotspots)
    ? defaultVersion.hotspots
    : [];
  const preload = buildPreloadInfo(profile.model3d || null, defaultVersion, id, requester);
  const camera = defaultVersion && defaultVersion.camera
    ? defaultVersion.camera
    : {
      orbit: '45deg 65deg 3m',
      target: '0m 0.6m 0m',
      fov: '45deg'
    };

  return {
    buildingId: id,
    buildingName: item.name,
    status: model3d.status,
    viewerType: model3d.viewerType,
    canView: model3d.canView && Boolean(defaultVersion && defaultVersion.signedUrl),
    poster: model3d.poster,
    activeVersion: defaultVersion ? defaultVersion.version : '',
    versions: versionSummaries,
    tokenPolicy: {
      expiresInSeconds: config.assetSignExpireSeconds,
      refreshWindowSeconds: config.assetRefreshWindowSeconds,
      refreshEndpoint: '/api/assets/refresh',
      refreshSuggestion: '建议在过期前60秒静默续期'
    },
    preload,
    scene: defaultVersion ? {
      format: defaultVersion.format,
      entry: defaultVersion.signedUrl,
      environment: 'neutral',
      draco: defaultVersion.draco,
      ktx2: defaultVersion.ktx2,
      lod: buildSignedLodArray(defaultVersion.lod, id, defaultVersion.version, requester),
      expiresAt: defaultVersion.expiresAt
    } : {
      format: 'glb',
      entry: '',
      environment: 'neutral',
      draco: false,
      ktx2: false,
      lod: [],
      expiresAt: ''
    },
    camera,
    hotspots,
    hotspotGuide: hotspots.map((itemHotspot, index) => ({
      id: itemHotspot.id || `hotspot-${index + 1}`,
      title: itemHotspot.title || itemHotspot.name || `讲解点 ${index + 1}`,
      narration: itemHotspot.narration || itemHotspot.description || ''
    })),
    note: model3d.note || ''
  };
}

module.exports = {
  listBuildings,
  getBuilding,
  getBuildingModel3d,
  getBuildingModel3dManifest
};
