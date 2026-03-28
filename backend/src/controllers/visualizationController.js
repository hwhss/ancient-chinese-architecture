const {
  getVisualizationOverview,
  getVisualizationMapPoints,
  getVisualizationTimeline,
  getVisualizationStats
} = require('../services/visualizationService');
const { sendSuccess } = require('../utils/response');

async function getOverview(req, res, next) {
  try {
    const data = await getVisualizationOverview();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function getMapPoints(req, res, next) {
  try {
    const data = await getVisualizationMapPoints();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function getTimeline(req, res, next) {
  try {
    const data = await getVisualizationTimeline(req.query || {});
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const data = await getVisualizationStats(req.query || {});
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOverview,
  getMapPoints,
  getTimeline,
  getStats
};
