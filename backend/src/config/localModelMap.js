const path = require('path');
const fs = require('fs');
const config = require('./index');

const LOCAL_MODEL_MAP = {
  zhaozhou_bridge: {
    hd: [
      'Zhaozhou Bridge_hd.glb',
      'Zhaozhou Bridge.glb'
    ],
    lod0: [
      'Zhaozhou Bridge_lod0.glb',
      'Zhaozhou Bridge-low.glb',
      'Zhaozhou Bridge-lowpoly.glb'
    ]
  }
};

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return value ? [value] : [];
}

function findFirstExistingRelativePath(candidates) {
  if (!config.localModelDir) {
    return '';
  }

  for (const fileName of toArray(candidates)) {
    const relativePath = String(fileName || '').trim();
    if (!relativePath) {
      continue;
    }

    const absolutePath = path.join(config.localModelDir, relativePath);
    try {
      if (fs.existsSync(absolutePath)) {
        return relativePath;
      }
    } catch (error) {
      continue;
    }
  }

  return '';
}

function resolveModelEntry(buildingId) {
  const key = String(buildingId || '').trim();
  const value = LOCAL_MODEL_MAP[key];

  if (!value) {
    return { hd: [], lod0: [] };
  }

  if (typeof value === 'string') {
    return {
      hd: [value],
      lod0: []
    };
  }

  return {
    hd: toArray(value.hd),
    lod0: toArray(value.lod0)
  };
}

function toModelPublicUrl(relativePath) {
  if (!relativePath) {
    return '';
  }

  const fileUrlPath = `/models/${encodeURIComponent(relativePath).replace(/%2F/g, '/')}`;
  if (config.localModelBaseUrl) {
    return `${config.localModelBaseUrl}${fileUrlPath}`;
  }
  return fileUrlPath;
}

function getLocalModelRelativePathByBuildingId(buildingId) {
  return getLocalModelLodConfigByBuildingId(buildingId).hdRelativePath;
}

function getLocalModelUrlByBuildingId(buildingId) {
  return getLocalModelLodConfigByBuildingId(buildingId).hdUrl;
}

function getLocalModelLodConfigByBuildingId(buildingId) {
  const entry = resolveModelEntry(buildingId);

  const hdRelativePath = findFirstExistingRelativePath(entry.hd);
  const lod0RelativePath = findFirstExistingRelativePath(entry.lod0);

  const hdUrl = toModelPublicUrl(hdRelativePath);
  const lod0Url = toModelPublicUrl(lod0RelativePath);

  return {
    hdRelativePath,
    lod0RelativePath,
    hdUrl,
    lod0Url,
    hasLod: Boolean(hdUrl && lod0Url && hdUrl !== lod0Url)
  };
}

function getLocalModelLodUrlsByBuildingId(buildingId) {
  const configValue = getLocalModelLodConfigByBuildingId(buildingId);
  if (!configValue.hdUrl) {
    return {
      hdUrl: '',
      lod0Url: '',
      hasLod: false
    };
  }

  return {
    hdUrl: configValue.hdUrl,
    lod0Url: configValue.hasLod ? configValue.lod0Url : '',
    hasLod: configValue.hasLod
  };
}

module.exports = {
  LOCAL_MODEL_MAP,
  getLocalModelRelativePathByBuildingId,
  getLocalModelUrlByBuildingId,
  getLocalModelLodConfigByBuildingId,
  getLocalModelLodUrlsByBuildingId
};
