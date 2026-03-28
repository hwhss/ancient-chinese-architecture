#!/usr/bin/env node

const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function safeQuery(client, sql) {
  try {
    const result = await client.query(sql);
    return result.rows;
  } catch (error) {
    return [{ error: error.message }];
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ 未找到 DATABASE_URL');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ PostgreSQL 连接成功\n');

    const serverInfo = await safeQuery(client, `
      SELECT
        version() AS version,
        current_setting('data_directory') AS data_directory,
        current_setting('config_file') AS config_file,
        current_setting('hba_file') AS hba_file,
        current_database() AS current_database,
        current_user AS current_user
    `);

    console.log('=== Server Info ===');
    console.log(serverInfo[0]);
    console.log();

    const available = await safeQuery(client, `
      SELECT name, default_version, installed_version
      FROM pg_available_extensions
      WHERE name = 'vector'
    `);

    console.log('=== pg_available_extensions(vector) ===');
    console.log(available.length ? available : '未发现 vector');
    console.log();

    const installed = await safeQuery(client, `
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    `);

    console.log('=== pg_extension(vector) ===');
    console.log(installed.length ? installed : '未安装 vector');
    console.log();

    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✅ CREATE EXTENSION IF NOT EXISTS vector 执行成功');
    } catch (error) {
      console.log('❌ CREATE EXTENSION 执行失败:');
      console.log(error.message);
    }

    const postInstalled = await safeQuery(client, `
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    `);

    console.log('\n=== pg_extension(vector) after create ===');
    console.log(postInstalled.length ? postInstalled : '未安装 vector');
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
