/**
 * 验证并导入完整数据
 * 确保数据库数据量 >= JSON数据量
 * 执行: node scripts/verify-and-import-data.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  databaseUrl: 'postgresql://postgres:123456@localhost:5432/ancient_architecture',
  dataDir: path.join(__dirname, '..', 'data-jsondb')
};

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  divider: () => console.log('='.repeat(60))
};

// 统计JSON文件数据
function countJsonData() {
  const counts = {
    buildings: 0,
    knowledge: 0,
    visualization: 0,
    total: 0,
    details: {}
  };

  const categories = {
    'buildings': ['palace.json', 'garden.json', 'bridge.json', 'tower.json', 'defense.json', 'water.json', 'residence.json'],
    'knowledge': ['qa.json'],
    'visualization': ['chart.json', '3d-model.json', 'mg-animation.json', 'info-graphic.json']
  };

  for (const [category, files] of Object.entries(categories)) {
    counts.details[category] = {};
    
    for (const file of files) {
      const filePath = path.join(CONFIG.dataDir, category, file);
      if (!fs.existsSync(filePath)) continue;

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const count = Array.isArray(data) ? data.length : 1;
        
        counts[category] += count;
        counts.total += count;
        counts.details[category][file] = count;
      } catch (err) {
        logger.error(`读取 ${file} 失败: ${err.message}`);
      }
    }
  }

  return counts;
}

// 获取数据库当前数据量
async function getDbCounts(client) {
  const counts = {};
  const tables = [
    'buildings', 'building_profiles', 'knowledge_base',
    'info_graphics', 'mg_animations', 'model_3d', 'chart_data', 'chart_summary'
  ];

  for (const table of tables) {
    try {
      const result = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      counts[table] = parseInt(result.rows[0].count);
    } catch (err) {
      counts[table] = 0;
    }
  }

  return counts;
}

// 主函数
async function main() {
  logger.divider();
  logger.info('开始验证和导入数据');
  logger.divider();

  // 1. 统计JSON数据
  logger.info('统计JSON数据...');
  const jsonCounts = countJsonData();
  
  logger.info('JSON数据分布:');
  logger.info(`  - buildings: ${jsonCounts.buildings} 条`);
  logger.info(`  - knowledge: ${jsonCounts.knowledge} 条`);
  logger.info(`  - visualization: ${jsonCounts.visualization} 条`);
  logger.info(`  总计: ${jsonCounts.total} 条`);

  // 2. 连接数据库
  const client = new Client({ connectionString: CONFIG.databaseUrl });
  await client.connect();
  logger.success('数据库连接成功');

  // 3. 获取当前数据库数据量
  logger.info('获取当前数据库数据量...');
  const dbCounts = await getDbCounts(client);
  
  logger.info('数据库当前数据:');
  logger.info(`  - buildings: ${dbCounts.buildings} 条`);
  logger.info(`  - knowledge_base: ${dbCounts.knowledge_base} 条`);
  logger.info(`  - 可视化相关表: ${dbCounts.info_graphics + dbCounts.mg_animations + dbCounts.model_3d + dbCounts.chart_data} 条`);

  // 4. 比较并决定是否需要导入
  const dbTotal = dbCounts.buildings + dbCounts.knowledge_base + 
                  dbCounts.info_graphics + dbCounts.mg_animations + 
                  dbCounts.model_3d + dbCounts.chart_data;
  
  logger.divider();
  logger.info(`JSON数据: ${jsonCounts.total} 条`);
  logger.info(`数据库数据: ${dbTotal} 条`);
  
  if (dbTotal >= jsonCounts.total) {
    logger.success('数据库数据量 >= JSON数据量，无需导入');
  } else {
    logger.warn('数据库数据量 < JSON数据量，需要补充导入');
    logger.info('请运行: node migrations/005_import_jsondb.js');
  }

  await client.end();
  logger.divider();
  logger.success('验证完成!');
}

main().catch(err => {
  logger.error(`执行失败: ${err.message}`);
  process.exit(1);
});
