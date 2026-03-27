const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');

function readJsonFile(filename, defaultValue) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to parse ${filename}:`, error.message);
    return defaultValue;
  }
}

const knowledgeBase = readJsonFile('knowledge_base.json', []);
const materialLinks = readJsonFile('material_links.json', []);
const buildings = readJsonFile('buildings.json', []);

const materialMap = new Map(materialLinks.map((item) => [item.materialId, item]));
const buildingMap = new Map(buildings.map((item) => [item.id, item]));

function getKnowledgeBase() {
  return knowledgeBase;
}

function getMaterialLinks() {
  return materialLinks;
}

function getMaterialById(materialId) {
  return materialMap.get(materialId) || null;
}

function getBuildings() {
  return buildings;
}

function getBuildingById(id) {
  return buildingMap.get(id) || null;
}

module.exports = {
  getKnowledgeBase,
  getMaterialLinks,
  getMaterialById,
  getBuildings,
  getBuildingById
};
