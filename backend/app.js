const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const config = require('./src/config');
const { testConnection } = require('./src/config/database');
const { getKnowledgeBase, getMaterialLinks, getBuildings } = require('./src/repositories/dataRepository');

const dataSource = config.dataSource;

async function printBootstrapInfo() {
  const [knowledgeList, materialList, buildingList] = await Promise.all([
    getKnowledgeBase(),
    getMaterialLinks(),
    getBuildings()
  ]);

  console.log(`✅ 知识库加载完成，共 ${knowledgeList.length} 条数据`);
  console.log(`✅ 素材链接加载完成，共 ${materialList.length} 条数据`);
  console.log(`✅ 建筑名录加载完成，共 ${buildingList.length} 条数据`);
  console.log(`🧩 DATA_SOURCE: ${dataSource}`);
}

async function printDatabaseStatus() {
  if (dataSource !== 'postgres') {
    return;
  }

  const db = await testConnection();
  if (db.success) {
    console.log(`✅ PostgreSQL 连接正常: ${db.time}`);
  } else {
    if (config.forcePostgres) {
      throw new Error(`PostgreSQL 连接失败（FORCE_POSTGRES=true）：${db.error}`);
    }

    console.warn(`⚠️ PostgreSQL 连接失败: ${db.error}`);
  }
}

function assertDataSourcePolicy() {
  if (config.forcePostgres && dataSource !== 'postgres') {
    throw new Error(
      `当前 DATA_SOURCE=${dataSource}，但 FORCE_POSTGRES=true 要求必须使用 postgres。`
    );
  }
}

function startServer() {
  const server = app.listen(config.port, () => {
    console.log('\n🏯 古建筑AI导览服务已启动');
    console.log(`📍 本地访问: http://localhost:${config.port}`);
    console.log(`📍 健康检查: http://localhost:${config.port}/api/health`);
    console.log(`📍 问答接口: http://localhost:${config.port}/api/chat`);
    console.log(`📍 建筑列表: http://localhost:${config.port}/api/buildings`);
    console.log(`📍 素材接口: http://localhost:${config.port}/api/material?materialId=taihe_dian\n`);
  });

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${config.port} 已被占用，请关闭已有进程或修改 PORT 后重试。`);
      process.exit(1);
      return;
    }

    console.error('❌ 服务启动失败:', error && error.message ? error.message : error);
    process.exit(1);
  });
}

async function bootstrap() {
  assertDataSourcePolicy();
  await printBootstrapInfo();
  await printDatabaseStatus();
  startServer();
}

bootstrap().catch((error) => {
  console.error('❌ 启动流程异常:', error && error.message ? error.message : error);
  process.exit(1);
});

module.exports = app;
