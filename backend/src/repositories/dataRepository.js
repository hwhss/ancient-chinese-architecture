const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dataSource = String(process.env.DATA_SOURCE || 'json').trim().toLowerCase();

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
const buildingProfiles = readJsonFile('building_profiles.json', []);

const materialMap = new Map(materialLinks.map((item) => [item.materialId, item]));
const buildingMap = new Map(buildings.map((item) => [item.id, item]));
const buildingProfileMap = new Map(buildingProfiles.map((item) => [item.id, item]));

function toArray(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }
  return fallback;
}

function mapMaterialRow(row) {
  return {
    materialId: row.material_id,
    url: row.url,
    type: row.type,
    source: row.source
  };
}

function mapBuildingRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    location: row.location,
    description: row.description,
    image: row.image,
    tags: toArray(row.tags, [])
  };
}

function mapKnowledgeRow(row) {
  return {
    question: row.question,
    answer: row.answer,
    materialId: row.material_id,
    keywords: toArray(row.keywords, [])
  };
}

async function getModelVersionsByBuildingId(buildingId) {
  const versionRows = await query(
    `SELECT id, version, label, format, allowed_roles, model_url, draco, ktx2, preload, camera, sort_order
     FROM model_versions
     WHERE building_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [buildingId]
  );

  if (!versionRows.length) {
    return [];
  }

  const versionIdList = versionRows.map((item) => item.id);
  const lodRows = await query(
    `SELECT model_version_id, level, model_url
     FROM model_lods
     WHERE model_version_id = ANY($1::int[])
     ORDER BY level ASC, id ASC`,
    [versionIdList]
  );

  const hotspotRows = await query(
    `SELECT model_version_id, hotspot_key, title, name, description, narration, position, sort_order
     FROM model_hotspots
     WHERE model_version_id = ANY($1::int[])
     ORDER BY sort_order ASC, id ASC`,
    [versionIdList]
  );

  const lodMap = new Map();
  lodRows.forEach((item) => {
    const list = lodMap.get(item.model_version_id) || [];
    list.push({
      level: item.level,
      modelUrl: item.model_url
    });
    lodMap.set(item.model_version_id, list);
  });

  const hotspotMap = new Map();
  hotspotRows.forEach((item) => {
    const list = hotspotMap.get(item.model_version_id) || [];
    list.push({
      id: item.hotspot_key,
      title: item.title,
      name: item.name,
      description: item.description,
      narration: item.narration,
      position: item.position || null
    });
    hotspotMap.set(item.model_version_id, list);
  });

  return versionRows.map((row) => ({
    version: row.version,
    label: row.label,
    format: row.format,
    allowedRoles: toArray(row.allowed_roles, ['viewer', 'admin']),
    modelUrl: row.model_url,
    draco: Boolean(row.draco),
    ktx2: Boolean(row.ktx2),
    preload: row.preload || {},
    camera: row.camera || null,
    lod: lodMap.get(row.id) || [],
    hotspots: hotspotMap.get(row.id) || []
  }));
}

function mapProfileRow(row, versions) {
  const preload = row.model3d_preload || {};

  return {
    id: row.building_id,
    era: row.era,
    style: row.style,
    overviewSummary: row.overview_summary,
    keyPoints: toArray(row.key_points, []),
    history: row.history,
    architectureHighlights: toArray(row.architecture_highlights, []),
    culturalValue: row.cultural_value,
    model3d: {
      status: row.model3d_status,
      viewerType: row.model3d_viewer_type,
      poster: row.model3d_poster,
      preload,
      note: row.model3d_note,
      versions
    }
  };
}

async function getKnowledgeBaseJson() {
  return knowledgeBase;
}

async function getKnowledgeBasePostgres() {
  const rows = await query(
    'SELECT question, answer, material_id, keywords FROM knowledge_base ORDER BY id ASC',
    []
  );
  return rows.map(mapKnowledgeRow);
}

async function getMaterialLinksJson() {
  return materialLinks;
}

async function getMaterialLinksPostgres() {
  const rows = await query(
    'SELECT material_id, url, type, source FROM material_links ORDER BY id ASC',
    []
  );
  return rows.map(mapMaterialRow);
}

async function getMaterialByIdJson(materialId) {
  return materialMap.get(materialId) || null;
}

async function getMaterialByIdPostgres(materialId) {
  const rows = await query(
    `SELECT material_id, url, type, source
     FROM material_links
     WHERE material_id = $1
     ORDER BY id ASC
     LIMIT 1`,
    [materialId]
  );
  if (!rows.length) {
    return null;
  }
  return mapMaterialRow(rows[0]);
}

async function getBuildingsJson() {
  return buildings;
}

async function getBuildingsPostgres() {
  const rows = await query(
    'SELECT id, name, category, location, description, image, tags FROM buildings ORDER BY id ASC',
    []
  );
  return rows.map(mapBuildingRow);
}

async function getBuildingByIdJson(id) {
  return buildingMap.get(id) || null;
}

async function getBuildingByIdPostgres(id) {
  const rows = await query(
    'SELECT id, name, category, location, description, image, tags FROM buildings WHERE id = $1 LIMIT 1',
    [id]
  );
  if (!rows.length) {
    return null;
  }
  return mapBuildingRow(rows[0]);
}

async function getBuildingProfilesJson() {
  return buildingProfiles;
}

async function getBuildingProfilesPostgres() {
  const rows = await query(
    `SELECT building_id, era, style, overview_summary, history, cultural_value,
            key_points, architecture_highlights,
            model3d_status, model3d_viewer_type, model3d_poster, model3d_note, model3d_preload
     FROM building_profiles
     ORDER BY building_id ASC`,
    []
  );

  const list = [];
  for (const row of rows) {
    const versions = await getModelVersionsByBuildingId(row.building_id);
    list.push(mapProfileRow(row, versions));
  }
  return list;
}

async function getBuildingProfileByIdJson(id) {
  return buildingProfileMap.get(id) || null;
}

async function getBuildingProfileByIdPostgres(id) {
  const rows = await query(
    `SELECT building_id, era, style, overview_summary, history, cultural_value,
            key_points, architecture_highlights,
            model3d_status, model3d_viewer_type, model3d_poster, model3d_note, model3d_preload
     FROM building_profiles
     WHERE building_id = $1
     LIMIT 1`,
    [id]
  );
  if (!rows.length) {
    return null;
  }

  const versions = await getModelVersionsByBuildingId(id);
  return mapProfileRow(rows[0], versions);
}

async function getKnowledgeBase() {
  return dataSource === 'postgres' ? getKnowledgeBasePostgres() : getKnowledgeBaseJson();
}

async function getMaterialLinks() {
  return dataSource === 'postgres' ? getMaterialLinksPostgres() : getMaterialLinksJson();
}

async function getMaterialById(materialId) {
  return dataSource === 'postgres' ? getMaterialByIdPostgres(materialId) : getMaterialByIdJson(materialId);
}

async function getBuildings() {
  return dataSource === 'postgres' ? getBuildingsPostgres() : getBuildingsJson();
}

async function getBuildingById(id) {
  return dataSource === 'postgres' ? getBuildingByIdPostgres(id) : getBuildingByIdJson(id);
}

async function getBuildingProfiles() {
  return dataSource === 'postgres' ? getBuildingProfilesPostgres() : getBuildingProfilesJson();
}

async function getBuildingProfileById(id) {
  return dataSource === 'postgres' ? getBuildingProfileByIdPostgres(id) : getBuildingProfileByIdJson(id);
}

module.exports = {
  getKnowledgeBase,
  getMaterialLinks,
  getMaterialById,
  getBuildings,
  getBuildingById,
  getBuildingProfiles,
  getBuildingProfileById
};
