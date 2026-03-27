const express = require('express');

const { getHealth } = require('../controllers/healthController');
const { postChat } = require('../controllers/chatController');
const { getMaterialById, getMaterials } = require('../controllers/materialController');
const { getKnowledge } = require('../controllers/knowledgeController');
const { getBuildingList, getBuildingDetail } = require('../controllers/buildingController');

const router = express.Router();

router.get('/test', getHealth);
router.get('/api/health', getHealth);

router.post('/api/chat', postChat);

router.get('/api/material', getMaterialById);
router.get('/api/materials', getMaterials);

router.get('/api/knowledge', getKnowledge);

router.get('/api/buildings', getBuildingList);
router.get('/api/buildings/:id', getBuildingDetail);

module.exports = router;
