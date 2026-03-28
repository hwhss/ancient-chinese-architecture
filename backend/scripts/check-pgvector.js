#!/usr/bin/env node

const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ 未找到 DATABASE_URL，请先配置 backend/.env');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();

    const nowRows = await client.query('SELECT NOW() AS now_time');
    console.log(`✅ PostgreSQL 连通成功: ${nowRows.rows[0].now_time}`);

    const extRows = await client.query(
      "SELECT extname FROM pg_extension WHERE extname = 'vector' LIMIT 1"
    );

    if (extRows.rows.length > 0) {
      console.log('✅ pgvector 已安装（扩展 vector 存在）');
      process.exit(0);
    }

    console.log('⚠️ pgvector 未安装（扩展 vector 不存在）');
    process.exit(2);
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
