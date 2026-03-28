#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ 未找到 DATABASE_URL，请先配置 backend/.env');
    process.exit(1);
  }

  const sqlFile = path.join(__dirname, '..', 'migrations', '003_add_vector_retrieval.template.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ 找不到迁移文件: ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  const client = new Client({ connectionString });

  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ 向量迁移执行成功: 003_add_vector_retrieval.template.sql');
  } catch (error) {
    console.error('❌ 向量迁移执行失败:', error.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
