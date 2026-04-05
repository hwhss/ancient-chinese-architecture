const {
  listBuildings,
  getBuilding,
  getBuildingModel3d,
  getBuildingModel3dManifest
} = require('../services/buildingService');
const { sendSuccess, sendError } = require('../utils/response');

function getRequesterContext(req) {
  const host = String(req.get('host') || '').trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || String(req.protocol || 'http').trim();

  return {
    userId: String(req.headers['x-user-id'] || req.headers['x-user'] || 'anonymous').trim(),
    role: String(req.headers['x-user-role'] || 'viewer').trim().toLowerCase(),
    ip: String(req.ip || '').trim(),
    userAgent: String(req.headers['user-agent'] || '').trim(),
    requestBaseUrl: host ? `${protocol}://${host}`.replace(/\/$/, '') : '',
    imageSource: String(req.headers['x-image-source'] || '').trim().toLowerCase()
  };
}

async function getBuildingList(req, res, next) {
  try {
    const requester = getRequesterContext(req);
    const list = await listBuildings(req.query || {}, requester);
    return sendSuccess(res, list);
  } catch (error) {
    return next(error);
  }
}

async function getBuildingDetail(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    const requester = getRequesterContext(req);
    const item = await getBuilding(id, requester);

    if (!item) {
      return sendError(res, 404, '建筑不存在');
    }

    return sendSuccess(res, item);
  } catch (error) {
    return next(error);
  }
}

async function getBuildingModel(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    const requester = getRequesterContext(req);
    const model = await getBuildingModel3d(id, requester);

    if (!model) {
      return sendError(res, 404, '建筑不存在');
    }

    return sendSuccess(res, model);
  } catch (error) {
    return next(error);
  }
}

async function getBuildingModelManifest(req, res, next) {
  try {
    const id = String(req.params.id || '').trim();
    const requester = getRequesterContext(req);
    const manifest = await getBuildingModel3dManifest(id, requester);

    if (!manifest) {
      return sendError(res, 404, '建筑不存在');
    }

    return sendSuccess(res, manifest);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBuildingList,
  getBuildingDetail,
  getBuildingModel,
  getBuildingModelManifest
};
