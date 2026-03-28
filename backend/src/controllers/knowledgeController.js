const { getKnowledgeBase } = require('../repositories/dataRepository');
const { sendSuccess } = require('../utils/response');

async function getKnowledge(req, res, next) {
  try {
    const list = await getKnowledgeBase();
    return sendSuccess(res, list);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getKnowledge
};
