# VPS 部署迁移后期工作清单

## 文档定位

本文件用于后期 VPS 正式部署执行，覆盖以下事项：

1. PostgreSQL 主库部署与迁移。
2. pgvector 扩展启用与向量表初始化。
3. 向量入库、检索联调、前后端联调验收。
4. 故障回滚和常见问题排查。

说明：

1. 本文件是长期维护清单，不使用日期命名。
2. 当前本地阶段可继续使用 JSON；VPS 上线阶段以 PostgreSQL 为主。

## 阶段标注

- 当前阶段：本地开发与联调（允许 DATA_SOURCE=json）
- 后期阶段：VPS 部署（必须 DATA_SOURCE=postgres）

## 上线目标

1. 后端在 VPS 以 PostgreSQL + pgvector 运行。
2. `/api/chat` 支持关键词与混合检索（关键词 + 向量）。
3. `/api/health` 明确回显运行态：`runtime.dataSource`、`runtime.vectorRetrievalEnabled`。
4. 前端联调时可明确确认已连接 PG 运行实例。

## 一、环境准备清单

### 1.1 基础软件

1. Node.js 18+
2. PostgreSQL 15+（建议 15/16/17/18 任一稳定版）
3. pgvector 扩展（与 PostgreSQL 版本严格匹配）
4. PM2
5. Nginx

### 1.2 目录建议

1. 代码目录：`/srv/ancient-chinese-architecture`
2. 日志目录：`/var/log/ancient-architecture`
3. 备份目录：`/srv/db-backups`

## 二、环境变量清单（VPS 必填）

以下变量写入 `backend/.env`。

### 2.1 基础运行

```env
NODE_ENV=production
PORT=9527
DATA_SOURCE=postgres
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/ancient_architecture
```

### 2.2 资产签名链路

```env
PUBLIC_BASE_URL=https://your-domain.com
ASSET_SIGN_SECRET=replace_with_strong_secret
ASSET_SIGN_EXPIRE_SECONDS=600
ASSET_REFRESH_WINDOW_SECONDS=60
ASSET_REDIRECT_CACHE_SECONDS=30
ASSET_REDIRECT_SHARED_CACHE_SECONDS=60
```

### 2.3 检索与向量（生产建议）

```env
ENABLE_VECTOR_RETRIEVAL=true

# 关键词
CHAT_KEYWORD_SCORE_THRESHOLD=20
CHAT_KEYWORD_STRONG_THRESHOLD=60
CHAT_KEYWORD_TOP_K=5

# 向量
CHAT_VECTOR_SIMILARITY_THRESHOLD=0.20
CHAT_VECTOR_TOP_K=5

# 混合打分
CHAT_HYBRID_SCORE_THRESHOLD=0.20
CHAT_HYBRID_KEYWORD_WEIGHT=0.45
CHAT_HYBRID_VECTOR_WEIGHT=0.55

# DashScope embedding
EMBEDDING_PROVIDER=dashscope
EMBEDDING_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=replace_with_real_key
EMBEDDING_API_KEY=${DASHSCOPE_API_KEY}
EMBEDDING_MODEL=text-embedding-v4
EMBEDDING_DIM=1024
```

备注：`CHAT_HYBRID_KEYWORD_WEIGHT + CHAT_HYBRID_VECTOR_WEIGHT` 应保持接近 1。

## 三、数据库部署与迁移执行顺序

必须按顺序执行。

### 3.1 主表迁移 + 基础数据导入

在 `backend` 目录执行：

```bash
npm install
npm run db:migrate
npm run db:seed
```

### 3.2 启用 pgvector 扩展

可用 SQL：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

或使用现有脚本：

```bash
node scripts/enable-pgvector.js
```

### 3.3 向量表迁移

```bash
node scripts/apply-vector-migration.js
```

### 3.4 向量入库

确保 `DATA_SOURCE=postgres` 后执行：

```bash
npm run import:vectors
```

## 四、服务启动与守护

### 4.1 PM2 启动

```bash
cd backend
pm2 start app.js --name ancient-architecture-backend
pm2 save
pm2 startup
```

### 4.2 Nginx 代理要点

1. 反向代理到后端端口（默认 9527）。
2. HTTPS 证书可使用 Let's Encrypt。
3. 必须透传头：
   - `Host`
   - `X-Forwarded-For`
   - `X-Forwarded-Proto`

## 五、上线验收清单（必须全绿）

### 5.1 运行态验收

1. `GET /api/health` 返回 `code=200`。
2. `datasets` 计数正常。
3. `runtime.dataSource=postgres`。
4. `runtime.vectorRetrievalEnabled=true`。

### 5.2 功能验收

1. `/api/buildings`、`/api/buildings/:id` 返回正常。
2. 可视化接口正常：
   - `/api/visualization/overview`
   - `/api/visualization/map-points`
   - `/api/visualization/timeline`
   - `/api/visualization/stats`
3. 3D 签名链路可用：
   - `/api/assets/signed`
   - `/api/assets/refresh`
4. 聊天接口 `/api/chat` 可返回以下 source 之一：
   - `knowledge_base`
   - `knowledge_hybrid`
   - `knowledge_vector`
   - `ai`

### 5.3 向量检索验收

1. `npm run query:vectors` 可返回 TopK 结果。
2. 相似度阈值命中策略符合预期。
3. 复杂问法（同义改写）不明显劣化。

## 六、给前端同学的联调要求

前端要确保“联的是 PG 后端实例”，执行以下 4 步：

1. 将前端 `API_BASE_URL` 指向 VPS 后端地址。
2. 先调 `GET /api/health`，确认：
   - `runtime.dataSource=postgres`
   - `runtime.vectorRetrievalEnabled=true`
3. 再调 `POST /api/chat`，观察 `source` 字段变化。
4. 联调期间禁止以“数据库未切 PG 的环境”作为验收环境。

说明：前端不需要直接访问数据库，只需验证接口运行态和返回质量。

## 七、回滚策略

### 7.1 紧急回滚到 JSON

1. `.env` 设置 `DATA_SOURCE=json`
2. 可选关闭向量：`ENABLE_VECTOR_RETRIEVAL=false`
3. 重启 PM2 服务

### 7.2 风险隔离

1. 向量检索异常时，服务应自动降级到非向量路径。
2. 任何异常不得影响 `/api/chat` 可用性（至少要能走 AI 兜底）。

## 八、常见问题排查

1. 问题：`CREATE EXTENSION vector` 失败。
   - 原因：pgvector 与 PostgreSQL 版本不匹配。
   - 处理：安装匹配版本，或直接使用带 pgvector 的 PostgreSQL 镜像。

2. 问题：embedding 接口 404。
   - 原因：embedding 请求未走 `/embeddings` 端点。
   - 处理：确保 `EMBEDDING_API_URL` 为兼容模式根路径，服务端会自动拼接 `/embeddings`。

3. 问题：向量入库提示 `仅支持 PostgreSQL`。
   - 原因：`DATA_SOURCE` 仍为 `json`。
   - 处理：切换为 `DATA_SOURCE=postgres` 再执行入库。

4. 问题：聊天结果语义命中偏差大。
   - 原因：阈值偏高/偏低或知识样本不足。
   - 处理：先调整 `CHAT_VECTOR_SIMILARITY_THRESHOLD` 与 `CHAT_HYBRID_SCORE_THRESHOLD`，再补知识库样本。

## 九、上线后第一周观察项

1. `/api/chat` 的 source 分布（knowledge_base / knowledge_hybrid / knowledge_vector / ai）。
2. 高频问题命中率与人工主观准确率。
3. 接口响应耗时（重点观察向量检索开启后的 P95）。
4. 回滚开关可用性验证（一次演练）。
