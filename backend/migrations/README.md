# PostgreSQL Migration 操作文档

## 1. 目标

在不改变前端 API 的前提下，完成 PostgreSQL 建表和数据导入。

当前迁移文件：

1. `migrations/001_initial_schema.sql`：建表与索引
2. `migrations/000_apply_migration.js`：执行 SQL 迁移
3. `migrations/002_seed_data.js`：从 `backend/data/*.json` 全量导入

## 2. 一次性初始化（推荐）

在 `backend` 目录执行：

```powershell
npm install
npm run db:setup
```

`db:setup` 会依次执行：

1. `npm run db:migrate`
2. `npm run db:seed`

## 3. 分步执行

```powershell
npm run db:migrate
npm run db:seed
```

## 4. 环境变量

复制 `.env.example` 为 `.env` 后，至少确认：

1. `DATABASE_URL`
2. `DATA_SOURCE`
3. `SEED_TRUNCATE`（默认 true）

示例：

```env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/ancient_architecture
DATA_SOURCE=json
SEED_TRUNCATE=true
```

说明：

1. `SEED_TRUNCATE=true`：导入前清空目标表（开发环境推荐）
2. `SEED_TRUNCATE=false`：保留原数据并做增量 upsert

## 5. 导入范围

`002_seed_data.js` 已覆盖：

1. `buildings`
2. `building_profiles`
3. `model_versions`
4. `model_lods`
5. `model_hotspots`
6. `material_links`
7. `knowledge_base`

## 6. 快速验证

可用以下命令检查数据条数：

```powershell
psql -U postgres -d ancient_architecture -c "SELECT COUNT(*) FROM buildings;"
psql -U postgres -d ancient_architecture -c "SELECT COUNT(*) FROM model_versions;"
psql -U postgres -d ancient_architecture -c "SELECT COUNT(*) FROM model_hotspots;"
```

## 7. 常见问题

### Q1：`npm run db:migrate` 失败

1. 检查 `DATABASE_URL` 是否正确。
2. 检查 PostgreSQL 服务是否已启动。
3. 检查数据库 `ancient_architecture` 是否已创建。

### Q2：导入中断

1. 当前脚本使用事务，失败后会自动回滚。
2. 修复错误后重新执行 `npm run db:seed`。

### Q3：`DATA_SOURCE=postgres` 后如何确认确实走 PostgreSQL

1. 启动日志会输出 `DATA_SOURCE: postgres`。
2. `app.js` 会打印 `PostgreSQL 连接正常`（连接成功时）。
3. 可并行启动 `json/postgres` 两套实例后执行 `npm run test:phase3` 做返回一致性校验。

## 8. Phase 3 自动化回归

在 `backend` 目录执行：

```powershell
npm run test:phase3
```

该脚本会：

1. 自动启动 `postgres(9530)` 与 `json(9531)` 两个进程。
2. 轮询健康检查后，对核心只读接口做关键字段一致性对比。
3. 输出 `[SUCCESS] Phase 3 compare passed.` 或失败项清单。

## 9. 快速回滚（postgres -> json）

当 PostgreSQL 出现临时故障或联调异常时，按以下步骤回滚：

1. 停止当前后端进程。
2. 修改 `backend/.env`：`DATA_SOURCE=json`。
3. 在 `backend` 目录重新执行 `npm start`。
4. 检查启动日志是否出现 `DATA_SOURCE: json`。
5. 调用 `GET /api/health` 确认数据集计数正常。

恢复到 PostgreSQL：

1. 修改 `backend/.env`：`DATA_SOURCE=postgres`。
2. 重启服务。
3. 启动日志应出现 `PostgreSQL 连接正常`。
4. 建议执行 `npm run test:phase3` 做双源一致性回归。

## 10. 后续阶段

1. Phase 2：新增 PostgreSQL repository 与 `DATA_SOURCE` 切换
2. Phase 3：只读接口灰度切换
3. Phase 4：默认主读切到 PostgreSQL

详细计划见：`docs/2026-03-28_PostgreSQL迁移计划草案.md`

## 11. 前端同学快速测试建议

按“成本最低”排序：

1. 只测页面联调（最快）：直接用 `DATA_SOURCE=json` 启后端，不需要安装 PostgreSQL。
2. 测 PG 链路但不本地装库（推荐）：由后端同学起一套 `DATA_SOURCE=postgres` 服务，前端只改 `baseURL` 联调。
3. 前端本地全链路（可选）：用 Docker 起 PostgreSQL，再执行 `npm run db:setup`。

### 11.1 前端同学本地最小命令（无需 PG）

```powershell
cd backend
# .env 中保持 DATA_SOURCE=json
npm install
npm start
```

### 11.2 需要本地 PG 时（优先 Docker）

```powershell
docker run --name ancient-pg -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=ancient_architecture -p 5432:5432 -d postgres:15
```

然后执行：

```powershell
cd backend
# .env: DATA_SOURCE=postgres
npm run db:setup
npm start
```

### 11.3 联调前快速自检

1. `GET /api/health` 返回 `code=200`。
2. 日志中看到目标数据源：`DATA_SOURCE: json` 或 `DATA_SOURCE: postgres`。
3. PG 模式下日志出现 `PostgreSQL 连接正常`。
