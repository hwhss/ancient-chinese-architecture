const { getKnowledgeBase } = require('../repositories/dataRepository');
const { sendSuccess } = require('../utils/response');

function getKnowledge(req, res) {
  return sendSuccess(res, getKnowledgeBase());
}

module.exports = {
  getKnowledge
};
