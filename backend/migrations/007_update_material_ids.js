/* eslint-disable no-console */

/**
 * 更新 knowledge_base 表中的 material_id
 * 将旧格式ID (gugong_01) 更新为新格式ID (taihe_dian)
 *
 * 执行: node migrations/007_update_material_ids.js
 */

const { Pool } = require('pg');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  // dotenv is optional when environment variables are already injected.
}

const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ancient_architecture'
};

// 旧ID到新ID的映射表
const ID_MAPPING = {
  // 皇宫
  'gugong_01': 'taihe_dian',
  'gugong_02': 'qiankun_gong',
  'gugong_03': 'zhonghe_dian',
  'gugong_04': 'baohe_dian',
  'gugong_05': 'yangxin_dian',
  'gugong_06': 'yuhua_yuan',
  'gugong_07': 'wumen',
  'gugong_08': 'tiananmen',
  'shenyang_01': 'dazheng_dian',
  // 桥梁
  'zhaozhou_01': 'zhaozhou_bridge',
  'lugou_01': 'lugou_bridge',
  'guangji_01': 'guangji_bridge',
  // 园林
  'zhuozheng_01': 'zhuozheng_garden',
  'yiheyuan_01': 'yihe_yuan',
  // 城防
  'xian_01': 'xian_wall',
  'nanjing_01': 'nanjing_wall',
  // 民居
  'tulou_01': 'fujian_tulou',
  'qiaojia_01': 'qiaojia_dayuan',
  'pingyao_01': 'pingyao_city',
  'lijiang_01': 'lijiang_city',
  // 楼阁
  'yueyang_01': 'yueyang_tower',
  'kongmiao_01': 'qufu_kongmiao',
  // 水利
  'dujiangyan_01': 'dujiangyan',
  'kanerjing_01': 'kanerjing'
};

async function updateMaterialIds() {
  const pool = new Pool({
    connectionString: CONFIG.databaseUrl,
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('[INFO] 连接到数据库...');
    await pool.query('SELECT NOW()');
    console.log('[SUCCESS] 数据库连接成功');

    console.log('[INFO] 开始更新 material_id...');

    let totalUpdated = 0;

    // 遍历映射表，逐个更新
    for (const [oldId, newId] of Object.entries(ID_MAPPING)) {
      const result = await pool.query(
        'UPDATE knowledge_base SET material_id = $1 WHERE material_id = $2',
        [newId, oldId]
      );

      if (result.rowCount > 0) {
        console.log(`[UPDATED] ${oldId} -> ${newId} (${result.rowCount} 条)`);
        totalUpdated += result.rowCount;
      }
    }

    console.log(`[SUCCESS] 共更新 ${totalUpdated} 条记录`);

    // 检查是否还有旧格式的ID残留
    const checkResult = await pool.query(
      "SELECT DISTINCT material_id FROM knowledge_base WHERE material_id LIKE '%_%' AND material_id ~ '^[a-z]+_[0-9]+$'"
    );

    const remainingOldIds = checkResult.rows
      .map(row => row.material_id)
      .filter(id => /^[a-z]+_[0-9]{2}$/.test(id));

    if (remainingOldIds.length > 0) {
      console.warn('[WARN] 以下旧格式ID未更新:');
      remainingOldIds.forEach(id => console.warn(`  - ${id}`));
    } else {
      console.log('[SUCCESS] 所有旧格式ID已更新完成');
    }

    // 显示更新后的统计
    const statsResult = await pool.query(
      'SELECT material_id, COUNT(*) as count FROM knowledge_base WHERE material_id IS NOT NULL GROUP BY material_id ORDER BY count DESC'
    );

    console.log('\n[INFO] 当前 material_id 分布:');
    statsResult.rows.forEach(row => {
      console.log(`  - ${row.material_id}: ${row.count} 条`);
    });

  } catch (error) {
    console.error('[ERROR] 更新失败:', error.message);
    throw error;
  } finally {
    await pool.end();
    console.log('[INFO] 数据库连接已关闭');
  }
}

// 执行更新
updateMaterialIds().catch((error) => {
  console.error('[ERROR] 脚本执行失败:', error.message);
  process.exit(1);
});
