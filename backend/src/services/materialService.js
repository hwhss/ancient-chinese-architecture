const {
  getMaterialById,
  getMaterialLinks,
  getBuildingById
} = require('../repositories/dataRepository');
const { verifyAssetOwnership } = require('./assetVerification');

async function getMaterial(materialId) {
  if (!materialId) {
    return null;
  }

  const material = await getMaterialById(materialId);
  if (!material) {
    return null;
  }

  const building = await getBuildingById(materialId);
  const assetVerification = verifyAssetOwnership(material.url, {
    id: building && building.id ? building.id : materialId,
    materialId,
    name: building && building.name ? building.name : materialId,
    category: building && building.category ? building.category : '',
    tags: building && Array.isArray(building.tags) ? building.tags : [],
    keywords: building && Array.isArray(building.tags) ? building.tags : [],
    source: material.source || '',
    location: building && building.location ? building.location : '',
    province: building && building.province ? building.province : '',
    city: building && building.city ? building.city : ''
  }, {
    kind: 'material',
    trustExplicitBinding: true,
    explicitOwnerId: materialId
  });

  return {
    ...material,
    url: assetVerification.url,
    assetVerification
  };
}

async function listMaterials(query = {}) {
  const list = await getMaterialLinks();
  const { type } = query;

  return Promise.all(
    list
      .filter((item) => !type || item.type === type)
      .map(async (item) => {
        const building = item.materialId ? await getBuildingById(item.materialId) : null;
        const assetVerification = verifyAssetOwnership(item.url, {
          id: building && building.id ? building.id : item.materialId,
          materialId: item.materialId,
          name: building && building.name ? building.name : item.materialId,
          category: building && building.category ? building.category : '',
          tags: building && Array.isArray(building.tags) ? building.tags : [],
          keywords: building && Array.isArray(building.tags) ? building.tags : [],
          source: item.source || '',
          location: building && building.location ? building.location : '',
          province: building && building.province ? building.province : '',
          city: building && building.city ? building.city : ''
        }, {
          kind: 'material',
          trustExplicitBinding: true,
          explicitOwnerId: item.materialId
        });

        return {
          ...item,
          url: assetVerification.url,
          assetVerification
        };
      })
  );
}

module.exports = {
  getMaterial,
  listMaterials
};
