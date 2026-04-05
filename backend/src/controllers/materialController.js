const { getMaterial, listMaterials } = require('../services/materialService');
const { sendSuccess, sendError } = require('../utils/response');

function getRequesterContext(req) {
  return {
    imageSource: String(req.headers['x-image-source'] || '').trim().toLowerCase()
  };
}

async function getMaterialById(req, res, next) {
  try {
    const materialId = String(req.query.materialId || '').trim();
    if (!materialId) {
      return sendError(res, 400, 'materialId不能为空');
    }

    const requester = getRequesterContext(req);
    const material = await getMaterial(materialId, requester);
    if (!material) {
      return sendError(res, 404, '素材不存在');
    }

    if (!material.assetVerification || !material.assetVerification.verified) {
      return sendError(res, 422, '素材图片未通过后端命名校验', material.assetVerification || null);
    }

    return sendSuccess(res, {
      url: material.url,
      type: material.type,
      source: material.source,
      materialId: material.materialId,
      assetVerification: material.assetVerification
    });
  } catch (error) {
    return next(error);
  }
}

async function getMaterials(req, res, next) {
  try {
    const requester = getRequesterContext(req);
    const list = await listMaterials(req.query || {}, requester);
    return sendSuccess(res, list);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMaterialById,
  getMaterials
};
