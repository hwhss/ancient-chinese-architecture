const { getMaterial, listMaterials } = require('../services/materialService');
const { sendSuccess, sendError } = require('../utils/response');

async function getMaterialById(req, res, next) {
  try {
  const materialId = String(req.query.materialId || '').trim();
  if (!materialId) {
    return sendError(res, 400, 'materialId不能为空');
  }

  const material = await getMaterial(materialId);
  if (!material) {
    return sendError(res, 404, '素材不存在');
  }

  return sendSuccess(res, {
    url: material.url,
    type: material.type,
    source: material.source,
    materialId: material.materialId
  });
  } catch (error) {
    return next(error);
  }
}

async function getMaterials(req, res, next) {
  try {
    const list = await listMaterials(req.query || {});
    return sendSuccess(res, list);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMaterialById,
  getMaterials
};
