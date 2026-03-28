const express = require('express');

const { getHealth } = require('../controllers/healthController');
const { getSignedAsset, refreshSignedAsset } = require('../controllers/assetController');
const { postChat } = require('../controllers/chatController');
const { getMaterialById, getMaterials } = require('../controllers/materialController');
const { getKnowledge } = require('../controllers/knowledgeController');
const {
  getOverview,
	getMapPoints,
	getTimeline,
	getStats
} = require('../controllers/visualizationController');
const {
	getBuildingList,
	getBuildingDetail,
	getBuildingModel,
	getBuildingModelManifest
} = require('../controllers/buildingController');

const router = express.Router();

router.get('/test', getHealth);
router.get('/api/health', getHealth);
router.get('/api/assets/signed', getSignedAsset);
router.get('/api/assets/refresh', refreshSignedAsset);

router.post('/api/chat', postChat);

router.get('/api/material', getMaterialById);
router.get('/api/materials', getMaterials);

router.get('/api/knowledge', getKnowledge);
router.get('/api/visualization/overview', getOverview);
router.get('/api/visualization/map-points', getMapPoints);
router.get('/api/visualization/timeline', getTimeline);
router.get('/api/visualization/stats', getStats);

router.get('/api/buildings', getBuildingList);
router.get('/api/buildings/:id', getBuildingDetail);
router.get('/api/buildings/:id/model3d', getBuildingModel);
router.get('/api/buildings/:id/model3d/manifest', getBuildingModelManifest);

module.exports = router;
