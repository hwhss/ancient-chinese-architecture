const app = require('./src/app');
const config = require('./src/config');

const { getKnowledgeBase, getMaterialLinks, getBuildings } = require('./src/repositories/dataRepository');

console.log(`✅ 知识库加载完成，共 ${getKnowledgeBase().length} 条数据`);
console.log(`✅ 素材链接加载完成，共 ${getMaterialLinks().length} 条数据`);
console.log(`✅ 建筑名录加载完成，共 ${getBuildings().length} 条数据`);

app.listen(config.port, () => {
  console.log('\n🏯 古建筑AI导览服务已启动');
  console.log(`📍 本地访问: http://localhost:${config.port}`);
  console.log(`📍 健康检查: http://localhost:${config.port}/api/health`);
  console.log(`📍 问答接口: http://localhost:${config.port}/api/chat`);
  console.log(`📍 建筑列表: http://localhost:${config.port}/api/buildings`);
  console.log(`📍 素材接口: http://localhost:${config.port}/api/material?materialId=gugong_01\n`);
});

module.exports = app;
