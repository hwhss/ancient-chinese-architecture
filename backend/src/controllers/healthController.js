const { sendSuccess } = require('../utils/response');
const {
  getKnowledgeBase,
  getMaterialLinks,
  getBuildings
} = require('../repositories/dataRepository');

function getHealth(req, res) {
  const knowledgeCount = getKnowledgeBase().length;
  const materialCount = getMaterialLinks().length;
  const buildingCount = getBuildings().length;

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
}

module.exports = {
  getHealth
};
