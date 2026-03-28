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
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ 已执行 CREATE EXTENSION IF NOT EXISTS vector');

    const extRows = await client.query(
      "SELECT extname FROM pg_extension WHERE extname = 'vector' LIMIT 1"
    );

    if (extRows.rows.length > 0) {
      console.log('✅ pgvector 扩展已启用');
      process.exit(0);
    }

    console.log('⚠️ 扩展启用命令已执行，但仍未检测到 vector');
    process.exit(2);
  } catch (error) {
    console.error('❌ 启用 pgvector 失败:', error.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
