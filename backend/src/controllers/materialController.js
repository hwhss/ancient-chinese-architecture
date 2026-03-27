const { getMaterial, listMaterials } = require('../services/materialService');
const { sendSuccess, sendError } = require('../utils/response');

function getMaterialById(req, res) {
  const materialId = String(req.query.materialId || '').trim();
  if (!materialId) {
    return sendError(res, 400, 'materialId不能为空');
  }

  const material = getMaterial(materialId);
  if (!material) {
    return sendError(res, 404, '素材不存在');
  }

  return sendSuccess(res, {
    url: material.url,
    type: material.type,
    source: material.source,
    materialId: material.materialId
  });
}

function getMaterials(req, res) {
  const list = listMaterials(req.query || {});
  return sendSuccess(res, list);
}

module.exports = {
  getMaterialById,
  getMaterials
};
