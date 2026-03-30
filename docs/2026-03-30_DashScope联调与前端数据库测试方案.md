# 2026-03-30 DashScope联调与前端数据库测试方案

## 1. 背景与目标

你们当前后端已经支持通过环境变量读取 DashScope 配置，前端同学需要在不接触 API 密钥的前提下完成联调与数据库相关测试。

本文件给出：

1. 前端如何使用你本地后端 API 进行测试。
2. 密钥如何在本地与服务器环境安全配置。
3. 前端如何测试 PostgreSQL 数据源，以及 Docker 是否必须。
4. 3 月 30 日上次提交内容摘要（来自根目录 CHANGELOG）。

---

## 2. 已确认的代码事实（用于联调对齐）

### 2.1 Embedding 与 DashScope 配置来源

后端配置读取逻辑位于 backend/src/config/index.js，关键点如下：

1. EMBEDDING_PROVIDER 默认 dashscope。
2. EMBEDDING_API_URL 默认 https://dashscope.aliyuncs.com/compatible-mode/v1。
3. embeddingApiKey 优先读取 EMBEDDING_API_KEY，若无则回退读取 DASHSCOPE_API_KEY。
4. 向量检索总开关是 ENABLE_VECTOR_RETRIEVAL。

### 2.2 数据源切换

后端通过 DATA_SOURCE 在 json/postgres 之间切换：

1. DATA_SOURCE=json：不依赖 PostgreSQL，可直接联调接口。
2. DATA_SOURCE=postgres：走 PostgreSQL 仓储。

相关说明见 backend/.env.example 与 backend/migrations/README.md。

---

## 3. 前端同学如何使用你本地 API

## 3.1 核心原则

1. API 密钥只放在后端环境变量中。
2. 前端永远不直接持有 DASHSCOPE_API_KEY 或 EMBEDDING_API_KEY。
3. 前端只访问你后端暴露的业务接口（如 /api/chat）。

## 3.2 同机联调（你和前端在同一台机器）

直接启动后端：

```powershell
cd backend
npm install
npm start
```

前端 API Base URL 设置为：

```text
http://localhost:9527
```

## 3.3 局域网联调（前端在另一台机器）

1. 你本机启动后端。
2. 前端把 API Base URL 改为你的内网 IP，例如：

```text
http://192.168.1.88:9527
```

3. 放开防火墙 9527 端口（仅限内网）。
4. 如需公网临时联调，建议使用反向代理隧道，不要暴露数据库端口。

## 3.4 前端地址切换建议

已有 frontend/services/api.js 和 pages/dev-settings/dev-settings 支持地址覆盖，建议给前端三组地址：

1. local：本机 localhost
2. test：你的内网联调地址
3. prod：线上地址（后续）

---

## 4. 密钥配置：本地与服务器最佳实践

## 4.1 本地开发（Windows）

推荐写在 backend/.env（不提交仓库）：

```env
EMBEDDING_PROVIDER=dashscope
EMBEDDING_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=你的真实Key
EMBEDDING_API_KEY=${DASHSCOPE_API_KEY}
EMBEDDING_MODEL=text-embedding-v4
ENABLE_VECTOR_RETRIEVAL=true
```

注意：

1. .env 必须加入 .gitignore。
2. 不要把 key 写进前端代码或 docs 示例截图。

## 4.2 Linux 服务器（是否写 bashrc）

可以写 ~/.bashrc，但不推荐作为生产长期方案。建议优先级如下：

1. systemd EnvironmentFile（推荐）
2. 部署平台 Secret 管理（推荐）
3. ~/.bashrc（仅临时）

如果你们当前先用 bashrc，可先这样做：

```bash
echo 'export DASHSCOPE_API_KEY=你的真实Key' >> ~/.bashrc
echo 'export EMBEDDING_API_KEY=$DASHSCOPE_API_KEY' >> ~/.bashrc
source ~/.bashrc
```

更稳妥做法：

1. 新建 /etc/ancient-architecture/backend.env（chmod 600）。
2. systemd 服务文件中引用 EnvironmentFile。
3. 重启服务并用 /api/health 验证。

---

## 5. 前端要测数据库，是否必须 Docker

结论：不是必须，但强烈建议 Docker 化 PostgreSQL，复现最稳定。

## 5.1 三种测试路径（按成本排序）

### 路径 A：只测页面联调（最快）

1. 后端用 DATA_SOURCE=json 启动。
2. 前端照常测接口和页面。
3. 不需要 PostgreSQL，不需要 Docker。

适用：页面功能联调、交互测试。

### 路径 B：共享你的测试后端（推荐）

1. 你把后端切到 DATA_SOURCE=postgres 并保证数据已导入。
2. 前端仅改 API Base URL 连你的后端。
3. 前端本地不需要数据库也不需要 Docker。

适用：前端验证真实 PG 数据效果，但不想维护本地库。

### 路径 C：前端本地全链路（可选）

前端同学自己起 PostgreSQL（推荐 Docker）：

```powershell
docker run --name ancient-pg -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=ancient_architecture -p 5432:5432 -d postgres:15
```

然后后端配置：

```env
DATA_SOURCE=postgres
DATABASE_URL=postgresql://postgres:123456@localhost:5432/ancient_architecture
```

执行：

```powershell
cd backend
npm run db:setup
npm start
```

适用：前端或测试同学要独立复现完整链路。

---

## 6. 联调验收清单（建议发给前端）

1. 健康检查通过：GET /api/health 返回 code=200。
2. 聊天接口可用：POST /api/chat 有稳定响应。
3. 3D 相关接口可用：/api/buildings、/api/buildings/:id/model3d/manifest。
4. 若启用向量检索：日志无 embedding 配置缺失警告。
5. PG 模式下启动日志出现 PostgreSQL 连接正常。

---

## 7. 2026-03-30 上次提交摘要（来自根目录 CHANGELOG）

本次提交主要是前端体验增强与页面能力扩展，核心包括：

1. 全局动画系统优化（App.vue）。
2. 首页新增骨架屏、每日推荐、收藏快捷入口（pages/home/home.vue）。
3. AI 问答页新增消息搜索、会话历史加载优化（pages/index/index.vue）。
4. 地图页新增标记聚合与视图切换优化（pages/map/map.vue）。
5. 详情页接入收藏能力（pages/detail/detail.vue）。
6. 新增收藏页与骨架屏组件（pages/favorites/favorites.vue、components/SkeletonScreen.vue）。

该摘要可作为前后端联调背景，帮助前端确定优先测试入口。

---

## 8. 推荐你现在的落地动作

1. 你本地后端先固定一套可访问地址（内网 IP + 9527）。
2. 把该地址发给前端，前端在 dev-settings 里保存为 test 预设。
3. 后端先以 DATA_SOURCE=json 保证基础接口通，再切换 DATA_SOURCE=postgres 做二轮联调。
4. 服务器阶段再把密钥迁到 systemd EnvironmentFile，不再依赖 bashrc。
