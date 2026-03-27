const { listBuildings, getBuilding } = require('../services/buildingService');
const { sendSuccess, sendError } = require('../utils/response');

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

module.exports = {
  getBuildingList,
  getBuildingDetail
};
