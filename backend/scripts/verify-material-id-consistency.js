/* eslint-disable no-console */

/**
 * 验证 knowledge_base 表中的 material_id 与 buildings 表的一致性
 *
 * 执行: node scripts/verify-material-id-consistency.js
 */

const { Pool } = require('pg');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  // dotenv is optional
}

const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ancient_architecture'
};

async function verifyConsistency() {
  const pool = new Pool({
    connectionString: CONFIG.databaseUrl,
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('[INFO] 连接到数据库...');
    await pool.query('SELECT NOW()');
    console.log('[SUCCESS] 数据库连接成功\n');

    // 1. 获取所有有效的建筑ID
    const buildingsResult = await pool.query('SELECT id, name FROM buildings ORDER BY id');
    const validBuildingIds = new Set(buildingsResult.rows.map(row => row.id));
    const buildingIdToName = Object.fromEntries(buildingsResult.rows.map(row => [row.id, row.name]));

    console.log(`[INFO] 数据库中有 ${validBuildingIds.size} 个建筑:\n`);
    buildingsResult.rows.forEach(row => {
      console.log(`  - ${row.id}: ${row.name}`);
    });
    console.log();

    // 2. 获取知识库中使用的所有 material_id
    const kbResult = await pool.query(
      'SELECT DISTINCT material_id FROM knowledge_base WHERE material_id IS NOT NULL ORDER BY material_id'
    );
    const kbMaterialIds = kbResult.rows.map(row => row.material_id);

    console.log(`[INFO] 知识库中使用了 ${kbMaterialIds.length} 个 material_id:\n`);

    // 3. 检查一致性
    const validIds = [];
    const invalidIds = [];

    for (const materialId of kbMaterialIds) {
      if (validBuildingIds.has(materialId)) {
        validIds.push({
          id: materialId,
          name: buildingIdToName[materialId]
        });
      } else {
        invalidIds.push(materialId);
      }
    }

    console.log(`[SUCCESS] 有效的 material_id (${validIds.length} 个):\n`);
    validIds.forEach(item => {
      console.log(`  ✓ ${item.id} -> ${item.name}`);
    });
    console.log();

    if (invalidIds.length > 0) {
      console.error(`[ERROR] 无效的 material_id (${invalidIds.length} 个):\n`);
      invalidIds.forEach(id => {
        console.error(`  ✗ ${id} (不存在于 buildings 表中)`);
      });
      console.error();
      console.error('[ERROR] 请运行以下修复命令:');
      console.error('  node migrations/007_update_material_ids.js');
      return false;
    } else {
      console.log('[SUCCESS] 所有 material_id 都有效！\n');

      // 4. 统计每个建筑关联的知识库问题数量
      const statsResult = await pool.query(`
        SELECT 
          kb.material_id,
          b.name as building_name,
          COUNT(*) as question_count
        FROM knowledge_base kb
        LEFT JOIN buildings b ON kb.material_id = b.id
        WHERE kb.material_id IS NOT NULL
        GROUP BY kb.material_id, b.name
        ORDER BY question_count DESC
      `);

      console.log('[INFO] 每个建筑关联的问题数量:\n');
      statsResult.rows.forEach(row => {
        console.log(`  - ${row.building_name} (${row.material_id}): ${row.question_count} 个问题`);
      });

      return true;
    }

  } catch (error) {
    console.error('[ERROR] 验证失败:', error.message);
    return false;
  } finally {
    await pool.end();
    console.log('\n[INFO] 数据库连接已关闭');
  }
}

// 执行验证
verifyConsistency().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('[ERROR] 脚本执行失败:', error.message);
  process.exit(1);
});
