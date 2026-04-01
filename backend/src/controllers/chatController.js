const config = require('../config');
const { getChatResponse } = require('../services/chatService');
const { sendSuccess, sendError } = require('../utils/response');

async function postChat(req, res, next) {
  try {
    const question = String(req.body.question || '').trim();

    if (!question) {
      return sendError(res, 400, '问题不能为空');
    }

    if (question.length > config.questionMaxLength) {
      return sendError(res, 400, `问题过长，最多 ${config.questionMaxLength} 字`);
    }

    const result = await getChatResponse(question);

    const responseData = {
      question,
      answer: result.answer,
      source: result.source,
      materialId: result.materialId,
      matchedEntity: result.matchedEntity || null,
      entities: Array.isArray(result.entities) ? result.entities : []
    };

    if (result.debug) {
      responseData.debug = result.debug;
    }

    return sendSuccess(res, responseData);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  postChat
};
