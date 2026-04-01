/* eslint-disable no-console */

/**
 * data-jsondb -> PostgreSQL 完整数据导入脚本
 *
 * 执行: node migrations/005_import_jsondb.js
 * 或:   npm run db:import-jsondb
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  // dotenv is optional when environment variables are already injected.
}

const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ancient_architecture',
  jsondbDir: path.join(__dirname, '..', 'data-jsondb'),
  truncateBeforeInsert: String(process.env.SEED_TRUNCATE || 'true').toLowerCase() === 'true'
};

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  divider: () => console.log('='.repeat(50))
};

function readJsonFile(filename) {
  const filePath = path.join(CONFIG.jsondbDir, filename);
  if (!fs.existsSync(filePath)) {
    logger.warn(`文件不存在: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    logger.error(`解析 ${filename} 失败: ${error.message}`);
    return null;
  }
}

function readJsonArray(filename) {
  const data = readJsonFile(filename);
  return Array.isArray(data) ? data : [];
}

function toJson(value, fallback) {
  if (value === undefined || value === null) {
    return JSON.stringify(fallback);
  }
  return JSON.stringify(value);
}

class JsonDbImporter {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = new Pool({
        connectionString: CONFIG.databaseUrl,
        max: Number(process.env.DB_POOL_MAX || 10),
        idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000),
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 2000),
      });
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.success('数据库连接成功');
      return true;
    } catch (error) {
      logger.error(`数据库连接失败: ${error.message}`);
      return false;
    }
  }

  async truncateTables() {
    if (!CONFIG.truncateBeforeInsert) return;
    const tables = [
      'chart_summary', 'chart_data', 'model_3d',
      'mg_animations', 'info_graphics',
      'model_hotspots', 'model_lods', 'model_versions',
      'building_profiles', 'buildings',
      'material_links', 'knowledge_base'
    ];
    for (const table of tables) {
      await this.pool.query(`TRUNCATE TABLE ${table} CASCADE`);
      logger.info(`已清空表: ${table}`);
    }
  }

  async importBuildings() {
    const categories = ['palace', 'garden', 'bridge', 'tower', 'defense', 'water', 'residence'];
    let total = 0;

    for (const cat of categories) {
      const rows = readJsonArray(`buildings/${cat}.json`);
      for (const item of rows) {
        await this.pool.query(
          `INSERT INTO buildings (
            id, name, name_en, alias, category, location,
            province, city, lat, lng, heritage_level, open_status,
            main_era_start, main_era_end, dynasty, description,
            architecture_highlights, tags, source_url, source_name,
            confidence, area_sqm, height_m, length_m, length_km,
            width_m, span_m, diameter_m, floors
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16,
            $17, $18, $19, $20,
            $21, $22, $23, $24, $25,
            $26, $27, $28, $29
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, name_en = EXCLUDED.name_en,
            alias = EXCLUDED.alias, category = EXCLUDED.category,
            location = EXCLUDED.location, province = EXCLUDED.province,
            city = EXCLUDED.city, lat = EXCLUDED.lat, lng = EXCLUDED.lng,
            heritage_level = EXCLUDED.heritage_level,
            open_status = EXCLUDED.open_status,
            main_era_start = EXCLUDED.main_era_start,
            main_era_end = EXCLUDED.main_era_end,
            dynasty = EXCLUDED.dynasty,
            description = EXCLUDED.description,
            architecture_highlights = EXCLUDED.architecture_highlights,
            tags = EXCLUDED.tags, source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            confidence = EXCLUDED.confidence,
            area_sqm = EXCLUDED.area_sqm, height_m = EXCLUDED.height_m,
            length_m = EXCLUDED.length_m, length_km = EXCLUDED.length_km,
            width_m = EXCLUDED.width_m, span_m = EXCLUDED.span_m,
            diameter_m = EXCLUDED.diameter_m, floors = EXCLUDED.floors`,
          [
            item.id,
            item.name || '',
            item.name_en || null,
            item.alias || null,
            item.category || '',
            item.location || '',
            item.province || '',
            item.city || '',
            Number.isFinite(Number(item.lat)) ? Number(item.lat) : null,
            Number.isFinite(Number(item.lng)) ? Number(item.lng) : null,
            item.heritage_level || null,
            item.open_status || null,
            Number.isFinite(Number(item.main_era_start)) ? Number(item.main_era_start) : null,
            Number.isFinite(Number(item.main_era_end)) ? Number(item.main_era_end) : null,
            item.dynasty || null,
            item.description || '',
            item.architecture_highlights || null,
            toJson(item.tags || [], []),
            item.sourceUrl || null,
            item.sourceName || null,
            item.confidence || null,
            Number.isFinite(Number(item.area_sqm)) ? Number(item.area_sqm) : null,
            Number.isFinite(Number(item.height_m)) ? Number(item.height_m) : null,
            Number.isFinite(Number(item.length_m)) ? Number(item.length_m) : null,
            Number.isFinite(Number(item.length_km)) ? Number(item.length_km) : null,
            Number.isFinite(Number(item.width_m)) ? Number(item.width_m) : null,
            Number.isFinite(Number(item.span_m)) ? Number(item.span_m) : null,
            Number.isFinite(Number(item.diameter_m)) ? Number(item.diameter_m) : null,
            Number.isFinite(Number(item.floors)) ? Number(item.floors) : null,
          ]
        );
      }
      total += rows.length;
    }

    logger.success(`导入 buildings: ${total} 条`);
    return total;
  }

  async importBuildingProfiles() {
    const categories = ['palace', 'garden', 'bridge', 'tower', 'defense', 'water', 'residence'];
    let total = 0;

    for (const cat of categories) {
      const rows = readJsonArray(`buildings/${cat}.json`);
      for (const item of rows) {
        await this.pool.query(
          `INSERT INTO building_profiles (
            building_id, era, style, overview_summary, history, cultural_value,
            key_points, architecture_highlights, model3d_status, model3d_viewer_type,
            model3d_poster, model3d_note, model3d_preload
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13
          )
          ON CONFLICT (building_id) DO UPDATE SET
            era = EXCLUDED.era, style = EXCLUDED.style,
            overview_summary = EXCLUDED.overview_summary,
            history = EXCLUDED.history, cultural_value = EXCLUDED.cultural_value,
            key_points = EXCLUDED.key_points,
            architecture_highlights = EXCLUDED.architecture_highlights,
            model3d_status = EXCLUDED.model3d_status,
            model3d_viewer_type = EXCLUDED.model3d_viewer_type,
            model3d_poster = EXCLUDED.model3d_poster,
            model3d_note = EXCLUDED.model3d_note,
            model3d_preload = EXCLUDED.model3d_preload`,
          [
            item.id,
            item.dynasty || '',
            item.category || '',
            item.description || '',
            '',
            '',
            toJson(item.tags || [], []),
            toJson(item.architecture_highlights ? [item.architecture_highlights] : [], []),
            null, null, null, null, toJson({}, {})
          ]
        );
        total++;
      }
    }

    logger.success(`导入 building_profiles: ${total} 条`);
    return total;
  }

  async importKnowledgeBase() {
    const rows = readJsonArray('knowledge/qa.json');
    for (const item of rows) {
      await this.pool.query(
        `INSERT INTO knowledge_base (
          qa_id, question, answer, keywords, category
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING`,
        [
          item.id || null,
          item.question || null,
          item.answer || null,
          toJson(item.keywords || [], []),
          item.category || null
        ]
      );
    }
    logger.success(`导入 knowledge_base: ${rows.length} 条`);
    return rows.length;
  }

  async importInfoGraphics() {
    const data = readJsonFile('visualization/info-graphic.json');
    if (!data) return 0;

    await this.pool.query(
      `INSERT INTO info_graphics (
        graphic_id, title, layout, nodes, edges, labels, links,
        source_url, source_name, confidence, collected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (graphic_id) DO UPDATE SET
        title = EXCLUDED.title, layout = EXCLUDED.layout,
        nodes = EXCLUDED.nodes, edges = EXCLUDED.edges,
        labels = EXCLUDED.labels, links = EXCLUDED.links`,
      [
        'structure_hierarchy',
        data.title,
        data.layout,
        toJson(data.nodes, []),
        toJson(data.edges, []),
        toJson(data.labels, []),
        toJson(data.links, []),
        data.sourceUrl || null,
        data.sourceName || null,
        data.confidence || null,
        data.collectedAt || null
      ]
    );
    logger.success(`导入 info_graphics: 1 条`);
    return 1;
  }

  async importMgAnimations() {
    const data = readJsonFile('visualization/mg-animation.json');
    if (!data) return 0;

    await this.pool.query(
      `INSERT INTO mg_animations (
        animation_id, title, duration, lottie_url, auto_play, loop,
        key_points, phases, related_knowledge,
        source_url, source_name, confidence, collected_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (animation_id) DO UPDATE SET
        title = EXCLUDED.title, duration = EXCLUDED.duration,
        key_points = EXCLUDED.key_points, phases = EXCLUDED.phases`,
      [
        data.animationId,
        data.title,
        data.duration,
        data.lottieUrl || null,
        Boolean(data.autoPlay),
        Boolean(data.loop),
        toJson(data.keyPoints, []),
        toJson(data.phases, []),
        toJson(data.relatedKnowledge, []),
        data.sourceUrl || null,
        data.sourceName || null,
        data.confidence || null,
        data.collectedAt || null
      ]
    );
    logger.success(`导入 mg_animations: 1 条`);
    return 1;
  }

  async importModel3D() {
    const rows = readJsonArray('visualization/3d-model.json');
    for (const item of rows) {
      await this.pool.query(
        `INSERT INTO model_3d (
          model_id, model_name, model_url, init_config, markers,
          building_id, category, source_url, source_name,
          confidence, collected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (model_id) DO UPDATE SET
          model_name = EXCLUDED.model_name,
          model_url = EXCLUDED.model_url,
          init_config = EXCLUDED.init_config,
          markers = EXCLUDED.markers`,
        [
          item.modelId,
          item.modelName,
          item.modelUrl || null,
          toJson(item.initConfig, {}),
          toJson(item.markers, []),
          item.buildingId || null,
          item.category || null,
          item.sourceUrl || null,
          item.sourceName || null,
          item.confidence || null,
          item.collectedAt || null
        ]
      );
    }
    logger.success(`导入 model_3d: ${rows.length} 条`);
    return rows.length;
  }

  async importChartData() {
    const data = readJsonFile('visualization/chart.json');
    if (!data || !data.charts) return 0;

    for (const chart of data.charts) {
      await this.pool.query(
        `INSERT INTO chart_data (
          chart_id, title, unit, x_axis, series, legend, tooltip, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (chart_id) DO UPDATE SET
          title = EXCLUDED.title, series = EXCLUDED.series`,
        [
          chart.id,
          chart.title,
          chart.unit || null,
          toJson(chart.xAxis || [], []),
          toJson(chart.series, []),
          toJson(chart.legend || [], []),
          Boolean(chart.tooltip),
          chart.description || null
        ]
      );
    }

    if (data.summary) {
      await this.pool.query(
        `INSERT INTO chart_summary (
          total_buildings, world_heritage, national_heritage,
          earliest_year, latest_year, top_province, top_dynasty,
          source_url, source_name, confidence, collected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING`,
        [
          data.summary.totalBuildings || 0,
          data.summary.worldHeritage || 0,
          data.summary.nationalHeritage || 0,
          data.summary.earliestYear || null,
          data.summary.latestYear || null,
          data.summary.topProvince || null,
          data.summary.topDynasty || null,
          data.sourceUrl || null,
          data.sourceName || null,
          data.confidence || null,
          data.collectedAt || null
        ]
      );
    }

    logger.success(`导入 chart_data: ${data.charts.length} 条`);
    return data.charts.length;
  }

  async importAll() {
    logger.divider();
    logger.info('开始导入 data-jsondb 数据...');
    logger.divider();

    try {
      await this.pool.query('BEGIN');

      await this.importBuildings();
      await this.importBuildingProfiles();
      await this.importKnowledgeBase();
      await this.importInfoGraphics();
      await this.importMgAnimations();
      await this.importModel3D();
      await this.importChartData();

      await this.pool.query('COMMIT');

      logger.divider();
      logger.success('data-jsondb 数据导入完成！');
      logger.divider();
    } catch (error) {
      await this.pool.query('ROLLBACK');
      logger.error(`导入失败: ${error.message}`);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      logger.info('数据库连接已关闭');
    }
  }
}

async function main() {
  const importer = new JsonDbImporter();
  try {
    const connected = await importer.connect();
    if (!connected) process.exit(1);
    await importer.truncateTables();
    await importer.importAll();
  } catch (error) {
    logger.error(`脚本执行失败: ${error.message}`);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { JsonDbImporter };
