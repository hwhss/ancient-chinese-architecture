const {
  listBuildings,
  getBuilding,
  getBuildingModel3d,
  getBuildingModel3dManifest
} = require('../services/buildingService');
const { sendSuccess, sendError } = require('../utils/response');

function getRequesterContext(req) {
  return {
    userId: String(req.headers['x-user-id'] || req.headers['x-user'] || 'anonymous').trim(),
    role: String(req.headers['x-user-role'] || 'viewer').trim().toLowerCase(),
    ip: String(req.ip || '').trim(),
    userAgent: String(req.headers['user-agent'] || '').trim()
  };
}

function getBuildingList(req, res) {
  const list = listBuildings(req.query || {});
  return sendSuccess(res, list);
}

function getBuildingDetail(req, res) {
  const id = String(req.params.id || '').trim();
  const item = getBuilding(id);

  if (!item) {
    return sendError(res, 404, '建筑不存在');
  }

  return sendSuccess(res, item);
}

function getBuildingModel(req, res) {
  const id = String(req.params.id || '').trim();
  const requester = getRequesterContext(req);
  const model = getBuildingModel3d(id, requester);

  if (!model) {
    return sendError(res, 404, '建筑不存在');
  }

  return sendSuccess(res, model);
}

function getBuildingModelManifest(req, res) {
  const id = String(req.params.id || '').trim();
  const requester = getRequesterContext(req);
  const manifest = getBuildingModel3dManifest(id, requester);

  if (!manifest) {
    return sendError(res, 404, '建筑不存在');
  }

  return sendSuccess(res, manifest);
}

module.exports = {
  getBuildingList,
  getBuildingDetail,
  getBuildingModel,
  getBuildingModelManifest
};
