/**
 * 本地数据库设置脚本
 * 执行：node scripts/local-db-setup.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  databaseUrl: 'postgresql://postgres:123456@localhost:5432/ancient_architecture',
  migrationsDir: path.join(__dirname, '..', 'migrations')
};

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

async function executeSqlFile(client, filename) {
  const filepath = path.join(CONFIG.migrationsDir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  const sql = fs.readFileSync(filepath, 'utf8');
  await client.query(sql);
  logger.success(`${filename} executed`);
}

async function setupDatabase() {
  const client = new Client({ connectionString: CONFIG.databaseUrl });
  
  try {
    await client.connect();
    logger.success('Database connected');

    // 1. 执行初始表结构
    await executeSqlFile(client, '001_initial_schema.sql');
    
    // 2. 执行扩展表结构
    await executeSqlFile(client, '004_expand_schema_for_jsondb.sql');
    
    // 3. 添加 dynasty 字段
    await executeSqlFile(client, '006_add_dynasty_field.sql');

    logger.success('Database setup completed!');
  } catch (error) {
    logger.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
