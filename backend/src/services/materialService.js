const {
  getMaterialById,
  getMaterialLinks
} = require('../repositories/dataRepository');

function getMaterial(materialId) {
  if (!materialId) {
    return null;
  }
  return getMaterialById(materialId);
}

function listMaterials(query = {}) {
  const list = getMaterialLinks();
  const { type } = query;

  if (!type) {
    return list;
  }

  return list.filter((item) => item.type === type);
}

module.exports = {
  getMaterial,
  listMaterials
};
