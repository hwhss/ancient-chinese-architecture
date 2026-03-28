/* eslint-disable no-console */

/**
 * JSON -> PostgreSQL 数据导入脚本
 *
 * 执行: node migrations/002_seed_data.js
 * 或:   npm run db:seed
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
  dataDir: path.join(__dirname, '..', 'data'),
  truncateBeforeInsert: String(process.env.SEED_TRUNCATE || 'true').toLowerCase() === 'true'
};

// ==================== 日志工具 ====================
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  divider: () => console.log('='.repeat(50))
};

// ==================== 数据读取工具 ====================
function readJsonFile(filename, defaultValue = []) {
  const filePath = path.join(CONFIG.dataDir, filename);
  
  if (!fs.existsSync(filePath)) {
    logger.warn(`文件不存在: ${filePath}`);
    return defaultValue;
  }
  
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    logger.error(`解析 ${filename} 失败: ${error.message}`);
    return defaultValue;
  }
}

function normalizeModelVersions(profile) {
  const model3d = profile && profile.model3d ? profile.model3d : null;
  if (!model3d) {
    return [];
  }

  if (Array.isArray(model3d.versions) && model3d.versions.length > 0) {
    return model3d.versions.map((item, index) => ({
      version: item.version || `v${index + 1}`,
      label: item.label || `版本 ${index + 1}`,
      format: item.format || model3d.format || 'glb',
      allowedRoles: Array.isArray(item.allowedRoles) ? item.allowedRoles : ['viewer', 'admin'],
      modelUrl: item.modelUrl || '',
      draco: Boolean(item.draco),
      ktx2: Boolean(item.ktx2),
      preload: item.preload || null,
      camera: item.camera || null,
      lod: Array.isArray(item.lod) ? item.lod : [],
      hotspots: Array.isArray(item.hotspots) ? item.hotspots : [],
      sortOrder: index
    }));
  }

  if (model3d.modelUrl) {
    return [{
      version: model3d.version || 'v1',
      label: model3d.label || '默认版本',
      format: model3d.format || 'glb',
      allowedRoles: Array.isArray(model3d.allowedRoles) ? model3d.allowedRoles : ['viewer', 'admin'],
      modelUrl: model3d.modelUrl,
      draco: Boolean(model3d.draco),
      ktx2: Boolean(model3d.ktx2),
      preload: model3d.preload || null,
      camera: model3d.camera || null,
      lod: Array.isArray(model3d.lod) ? model3d.lod : [],
      hotspots: Array.isArray(model3d.hotspots) ? model3d.hotspots : [],
      sortOrder: 0
    }];
  }

  return [];
}

function toJson(value, fallback) {
  if (value === undefined) {
    return JSON.stringify(fallback);
  }
  return JSON.stringify(value);
}

// ==================== 数据库操作 ====================
class DataImporter {
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
      
      // 测试连接
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
    if (!CONFIG.truncateBeforeInsert) {
      return;
    }
    
    const tables = [
      'model_hotspots',
      'model_lods',
      'model_versions',
      'building_profiles',
      'buildings',
      'material_links',
      'knowledge_base'
    ];
    
    try {
      for (const table of tables) {
        await this.pool.query(`TRUNCATE TABLE ${table} CASCADE`);
        logger.info(`已清空表: ${table}`);
      }
    } catch (error) {
      logger.error(`清空表失败: ${error.message}`);
      throw error;
    }
  }

  async batchInsert(tableName, columns, valuesList) {
    if (valuesList.length === 0) {
      return 0;
    }
    
    const placeholders = valuesList.map((_, i) => 
      `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
    ).join(', ');
    
    const flatValues = valuesList.flat();
    
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
    
    try {
      const result = await this.pool.query(query, flatValues);
      return result.rowCount;
    } catch (error) {
      logger.error(`插入 ${tableName} 失败: ${error.message}`);
      throw error;
    }
  }

  async importBuildings() {
    const rows = readJsonFile('buildings.json');

    for (const item of rows) {
      await this.pool.query(
        `INSERT INTO buildings (id, name, category, location, description, image, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           location = EXCLUDED.location,
           description = EXCLUDED.description,
           image = EXCLUDED.image,
           tags = EXCLUDED.tags`,
        [
          item.id,
          item.name || '',
          item.category || '',
          item.location || '',
          item.description || '',
          item.image || '',
          toJson(item.tags || [], [])
        ]
      );
    }

    logger.success(`导入 buildings: ${rows.length} 条`);
    return rows.length;
  }

  async importBuildingProfiles() {
    const rows = readJsonFile('building_profiles.json');

    for (const item of rows) {
      const model3d = item.model3d || {};
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
          era = EXCLUDED.era,
          style = EXCLUDED.style,
          overview_summary = EXCLUDED.overview_summary,
          history = EXCLUDED.history,
          cultural_value = EXCLUDED.cultural_value,
          key_points = EXCLUDED.key_points,
          architecture_highlights = EXCLUDED.architecture_highlights,
          model3d_status = EXCLUDED.model3d_status,
          model3d_viewer_type = EXCLUDED.model3d_viewer_type,
          model3d_poster = EXCLUDED.model3d_poster,
          model3d_note = EXCLUDED.model3d_note,
          model3d_preload = EXCLUDED.model3d_preload`,
        [
          item.id,
          item.era || '',
          item.style || '',
          item.overviewSummary || '',
          item.history || '',
          item.culturalValue || '',
          toJson(item.keyPoints || [], []),
          toJson(item.architectureHighlights || [], []),
          model3d.status || null,
          model3d.viewerType || null,
          model3d.poster || null,
          model3d.note || null,
          toJson(model3d.preload || {}, {})
        ]
      );
    }

    logger.success(`导入 building_profiles: ${rows.length} 条`);
    return rows.length;
  }

  async importModelVersionsAndChildren() {
    const profiles = readJsonFile('building_profiles.json');
    let versionCount = 0;
    let lodCount = 0;
    let hotspotCount = 0;

    for (const profile of profiles) {
      const versions = normalizeModelVersions(profile);

      for (const ver of versions) {
        const insertVersion = await this.pool.query(
          `INSERT INTO model_versions (
            building_id, version, label, format, allowed_roles,
            model_url, draco, ktx2, preload, camera, sort_order
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
          )
          ON CONFLICT (building_id, version) DO UPDATE SET
            label = EXCLUDED.label,
            format = EXCLUDED.format,
            allowed_roles = EXCLUDED.allowed_roles,
            model_url = EXCLUDED.model_url,
            draco = EXCLUDED.draco,
            ktx2 = EXCLUDED.ktx2,
            preload = EXCLUDED.preload,
            camera = EXCLUDED.camera,
            sort_order = EXCLUDED.sort_order
          RETURNING id`,
          [
            profile.id,
            ver.version,
            ver.label,
            ver.format,
            toJson(ver.allowedRoles || [], []),
            ver.modelUrl || '',
            Boolean(ver.draco),
            Boolean(ver.ktx2),
            toJson(ver.preload || {}, {}),
            toJson(ver.camera || {}, {}),
            Number(ver.sortOrder || 0)
          ]
        );

        const modelVersionId = insertVersion.rows[0].id;
        versionCount += 1;

        await this.pool.query('DELETE FROM model_lods WHERE model_version_id = $1', [modelVersionId]);
        await this.pool.query('DELETE FROM model_hotspots WHERE model_version_id = $1', [modelVersionId]);

        for (const lodItem of ver.lod) {
          const level = Number(lodItem && lodItem.level);
          if (!Number.isFinite(level)) {
            continue;
          }

          const modelUrl = String((lodItem && (lodItem.modelUrl || lodItem.url)) || '').trim();
          await this.pool.query(
            `INSERT INTO model_lods (model_version_id, level, model_url, extra)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (model_version_id, level) DO UPDATE SET
               model_url = EXCLUDED.model_url,
               extra = EXCLUDED.extra`,
            [modelVersionId, level, modelUrl, toJson(lodItem || {}, {})]
          );
          lodCount += 1;
        }

        let hotspotOrder = 0;
        for (const hotspot of ver.hotspots) {
          const hotspotKey = String((hotspot && (hotspot.id || hotspot.hotspotKey)) || `hotspot-${hotspotOrder + 1}`);
          await this.pool.query(
            `INSERT INTO model_hotspots (
              model_version_id, hotspot_key, title, name, description, narration, position, sort_order
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8
            )
            ON CONFLICT (model_version_id, hotspot_key) DO UPDATE SET
              title = EXCLUDED.title,
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              narration = EXCLUDED.narration,
              position = EXCLUDED.position,
              sort_order = EXCLUDED.sort_order`,
            [
              modelVersionId,
              hotspotKey,
              hotspot && hotspot.title ? hotspot.title : null,
              hotspot && hotspot.name ? hotspot.name : null,
              hotspot && hotspot.description ? hotspot.description : null,
              hotspot && hotspot.narration ? hotspot.narration : null,
              hotspot && hotspot.position ? toJson(hotspot.position, null) : null,
              hotspotOrder
            ]
          );
          hotspotOrder += 1;
          hotspotCount += 1;
        }
      }
    }

    logger.success(`导入 model_versions: ${versionCount} 条`);
    logger.success(`导入 model_lods: ${lodCount} 条`);
    logger.success(`导入 model_hotspots: ${hotspotCount} 条`);
    return { versionCount, lodCount, hotspotCount };
  }

  async importMaterialLinks() {
    const rows = readJsonFile('material_links.json');
    const values = rows.map((item) => [
      item.materialId || null,
      item.type || null,
      item.url || null,
      item.source || null,
      toJson(item.tags || [], [])
    ]);

    const count = await this.batchInsert(
      'material_links',
      ['material_id', 'type', 'url', 'source', 'tags'],
      values
    );
    logger.success(`导入 material_links: ${count} 条`);
    return count;
  }

  async importKnowledgeBase() {
    const rows = readJsonFile('knowledge_base.json');
    const values = rows.map((item) => [
      item.question || null,
      item.answer || null,
      item.materialId || null,
      toJson(item.keywords || [], []),
      item.category || null
    ]);

    const count = await this.batchInsert(
      'knowledge_base',
      ['question', 'answer', 'material_id', 'keywords', 'category'],
      values
    );
    logger.success(`导入 knowledge_base: ${count} 条`);
    return count;
  }

  async importAll() {
    logger.divider();
    logger.info('开始导入数据...');
    logger.divider();

    try {
      await this.pool.query('BEGIN');

      // 1. 主表
      await this.importBuildings();
      await this.importBuildingProfiles();

      // 2. 3D 关联表
      await this.importModelVersionsAndChildren();

      // 3. 其他表
      await this.importMaterialLinks();
      await this.importKnowledgeBase();

      await this.pool.query('COMMIT');

      logger.divider();
      logger.success('数据导入完成！');
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

// ==================== 脚本入口 ====================
async function main() {
  const importer = new DataImporter();
  
  try {
    // 1. 连接数据库
    const connected = await importer.connect();
    if (!connected) {
      process.exit(1);
    }

    // 2. 清空旧数据（可选）
    await importer.truncateTables();

    // 3. 导入所有数据
    await importer.importAll();

  } catch (error) {
    logger.error(`脚本执行失败: ${error.message}`);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { DataImporter, normalizeModelVersions };
