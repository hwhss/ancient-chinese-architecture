const { sendSuccess } = require('../utils/response');
const config = require('../config');
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
      runtime: {
        dataSource: config.dataSource,
        vectorRetrievalEnabled: Boolean(config.enableVectorRetrieval && config.dataSource === 'postgres')
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
