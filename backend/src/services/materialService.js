const {
  getMaterialById,
  getMaterialLinks
} = require('../repositories/dataRepository');

async function getMaterial(materialId) {
  if (!materialId) {
    return null;
  }
  return getMaterialById(materialId);
}

async function listMaterials(query = {}) {
  const list = await getMaterialLinks();
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
