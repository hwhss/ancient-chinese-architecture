const { sendSuccess } = require('../utils/response');
const {
  getKnowledgeBase,
  getMaterialLinks,
  getBuildings
} = require('../repositories/dataRepository');

async function getHealth(req, res, next) {
  try {
    const [knowledgeList, materialList, buildingList] = await Promise.all([
      getKnowledgeBase(),
      getMaterialLinks(),
      getBuildings()
    ]);

    const knowledgeCount = knowledgeList.length;
    const materialCount = materialList.length;
    const buildingCount = buildingList.length;

    return sendSuccess(res, {
      service: 'ancient-architecture-backend',
      status: 'ok',
      datasets: {
        knowledge: knowledgeCount,
        materials: materialCount,
        buildings: buildingCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHealth
};
