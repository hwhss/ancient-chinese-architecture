# PostgreSQL 迁移计划草案（古建筑AI导览后端）

## 1. 目标与范围

目标：

1. 将后端数据存储从 JSON 文件迁移到 PostgreSQL。
2. 前端接口路径与返回结构保持不变（不影响现有页面）。
3. 保留签名 URL、角色过滤、token 续期等既有安全逻辑。

迁移范围（本次）：

1. 建筑名录（buildings）
2. 建筑扩展档案（building_profiles）
3. 3D 模型版本与热点（model_versions, model_hotspots）
4. 素材链接（material_links）
5. 知识库问答（knowledge_base）

不在本次范围（后续迭代）：

1. 管理后台
2. 审核流与操作日志 UI
3. 全文检索优化（可后续接 pg_trgm / tsvector）

## 2. 迁移原则（硬约束）

1. API 不破坏：保持 `/api/buildings`、`/api/buildings/:id/model3d/manifest` 等现有契约。
2. 分阶段切换：先双读验证，再切主读，再下线 JSON。
3. 可回滚：每个阶段都可以快速回退到 JSON 数据源。
4. 可审计：迁移脚本可重复执行，带版本号与日志。
5. 最小风险：先迁只读链路，再迁写入链路（若后续新增写接口）。

## 3. 技术选型建议

推荐：

1. 数据库：PostgreSQL 15+
2. Node 驱动：`pg`
3. 迁移工具：`node-pg-migrate`（或 Knex migration，二选一）
4. 配置方式：环境变量（DATABASE_URL）

原因：

1. 你当前后端是 Node.js + Express，`pg` 接入最轻。
2. 不强制引入重 ORM，先保证平滑迁移和接口稳定。
3. 后续若需要可再升级到 Prisma/TypeORM，不阻断当前计划。

## 4. 目标数据模型（第一版）

### 4.1 buildings

1. id (PK, text)
2. name (text)
3. category (text)
4. location (text)
5. description (text)
6. image (text)
7. tags (jsonb)
8. created_at, updated_at (timestamptz)

### 4.2 building_profiles

1. building_id (PK/FK -> buildings.id)
2. era, style, overview_summary, history, cultural_value (text)
3. key_points (jsonb)
4. architecture_highlights (jsonb)
5. model3d_status, model3d_viewer_type, model3d_poster, model3d_note (text)
6. model3d_preload (jsonb)
7. created_at, updated_at (timestamptz)

### 4.3 model_versions

1. id (bigserial PK)
2. building_id (FK)
3. version (text)
4. label (text)
5. format (text)
6. allowed_roles (jsonb)
7. model_url (text)
8. draco (boolean)
9. ktx2 (boolean)
10. preload (jsonb)
11. camera (jsonb)
12. sort_order (int)
13. created_at, updated_at (timestamptz)

唯一约束建议：

1. unique(building_id, version)

### 4.4 model_lods

1. id (bigserial PK)
2. model_version_id (FK -> model_versions.id)
3. level (int)
4. model_url (text)
5. extra (jsonb)

唯一约束建议：

1. unique(model_version_id, level)

### 4.5 model_hotspots

1. id (bigserial PK)
2. model_version_id (FK)
3. hotspot_key (text)
4. title, name, description, narration (text)
5. position (jsonb)
6. sort_order (int)

### 4.6 material_links

1. id (bigserial PK)
2. material_id (text)
3. type (text)
4. url (text)
5. source (text)
6. tags (jsonb)

索引建议：

1. index(material_id)
2. index(type)

### 4.7 knowledge_base

1. id (bigserial PK)
2. question (text)
3. answer (text)
4. material_id (text)
5. keywords (jsonb)
6. category (text)

索引建议：

1. gin(keywords)
2. index(category)

## 5. 分阶段实施计划

### Phase 0：准备阶段（1-2 天）

1. 创建 PostgreSQL 实例（开发/测试）。
2. 增加环境变量：
   - DATABASE_URL
   - DB_POOL_MAX
   - DB_SSL（按环境）
3. 增加数据库健康检查（不替换现有 health，仅补充 db 状态）。

交付：

1. 后端可成功连接 PostgreSQL。
2. `/api/health` 可返回数据库连通状态字段（可选）。

### Phase 1：建表与导数（2-3 天）

1. 编写 migration（建表、索引、约束）。
2. 编写 seed/import 脚本：把 JSON 导入 PostgreSQL。
3. 导入后做一致性校验（数量、关键字段、随机抽样）。

交付：

1. 可重复执行导入脚本。
2. 导入报告（每张表条数 + 异常记录）。

### Phase 2：仓储层双实现（2-4 天）

1. 保留现有 JSON repository。
2. 新增 PG repository（同样的方法签名）。
3. 通过开关切换：`DATA_SOURCE=json|postgres`。

交付：

1. 服务层无感知切换数据源。
2. 本地可用环境变量切换数据源。

### Phase 3：只读接口灰度（2-3 天）

1. 先切读接口到 PostgreSQL：
   - /api/buildings
   - /api/buildings/:id
   - /api/buildings/:id/model3d
   - /api/buildings/:id/model3d/manifest
   - /api/material /api/materials
   - /api/knowledge
2. 比对 JSON 与 PG 返回结构一致性（关键字段快照测试）。

交付：

1. 接口回归通过。
2. 签名链路行为与当前一致。

### Phase 4：稳定与收口（1-2 天）

1. 将默认数据源改为 PostgreSQL。
2. JSON 仅保留为 seed 基线文件。
3. 增加备份与恢复文档。

交付：

1. 生产默认走 PostgreSQL。
2. 具备恢复流程（备份/回滚）。

## 6. 回滚方案

1. 保留 JSON repository，不删除。
2. 出现异常时将 `DATA_SOURCE` 切回 `json`。
3. 回滚后保留故障时刻 SQL/日志快照用于排查。

回滚触发条件（任一满足）：

1. 核心接口错误率显著上升。
2. manifest 结构异常影响 viewer 加载。
3. 查询性能无法满足当前基线。

## 7. 验收标准（必须全部满足）

1. 所有现有 API 路径不变，前端无需改调用方式。
2. 核心响应字段与旧版一致（允许新增非破坏字段）。
3. 3D manifest 仍满足：
   - 不泄露裸 modelUrl
   - scene/lod/preload 为签名 URL
   - refresh 行为一致
4. 查询性能在可接受范围（P95 指标可后续量化）。
5. 一键切回 JSON 成功。

## 8. 风险与应对

1. 风险：JSON 结构非规范化，导表时丢字段
   - 应对：导入前做 schema 映射清单 + 导入后抽样比对
2. 风险：数组/嵌套结构拆表后查询变复杂
   - 应对：第一版允许部分字段先存 jsonb，后续再逐步范式化
3. 风险：团队对 SQL 不熟
   - 应对：先用 repository 封装，服务层不直接写 SQL
4. 风险：联调环境 host/proto 差异
   - 应对：沿用 requestBaseUrl 优先策略，避免写死 localhost

## 9. 建议里程碑

1. M1（本周）：完成 Phase 0 + Phase 1
2. M2（下周）：完成 Phase 2 + Phase 3（测试环境）
3. M3（稳定后）：完成 Phase 4（切主读并观察）

## 10. 你现在可以先审的决策点

1. 是否同意采用 `pg + migration 工具`（不先上 ORM）？
2. 是否接受“先 jsonb 后范式化”的渐进策略？
3. 是否按 `DATA_SOURCE` 开关做双实现与回滚？
4. Phase 3 的灰度是否先只放内部环境？

---

如果你确认这个草案，我下一步可以直接给出：

1. 第一版 SQL 建表脚本
2. JSON -> PostgreSQL 导入脚本骨架
3. `DATA_SOURCE` 切换的 repository 目录改造方案

## 11. 2026-03-28 已落地内容

本次已完成：

1. 新增 migration 执行脚本：`backend/migrations/000_apply_migration.js`
2. 补齐全量 seed：`backend/migrations/002_seed_data.js`
   - 已覆盖 `buildings/building_profiles/model_versions/model_lods/model_hotspots/material_links/knowledge_base`
3. 增加 npm 命令：
   - `npm run db:migrate`
   - `npm run db:seed`
   - `npm run db:setup`
4. 更新 `backend/migrations/README.md`，统一为 npm 执行流程。
5. 更新 `backend/.env.example`：增加 `SEED_TRUNCATE`，并将 `PORT` 对齐为 `9527`。
6. 完成 Phase 2：仓储层双实现（`DATA_SOURCE=json|postgres`）。
   - `backend/src/repositories/dataRepository.js` 已支持 PostgreSQL 查询与 JSON 回退。
   - controller/service 调用链已切换为 async，支持 PG 异步读取。

## 12. 执行状态说明

已完成脚本语法检查：

1. `migrations/000_apply_migration.js` 语法通过
2. `migrations/002_seed_data.js` 语法通过

本机执行 `npm run db:migrate` 失败原因为：

1. PostgreSQL 账号认证失败（密码不匹配）

建议你本地执行前确认：

1. `.env` 中 `DATABASE_URL` 的用户名和密码正确
2. 数据库 `ancient_architecture` 已创建

更新（2026-03-28 二次执行）：

1. 已修正 `DATABASE_URL` 并创建数据库 `ancient_architecture`
2. 已成功执行 `npm run db:migrate`
3. 已成功执行 `npm run db:seed`

导入结果（实测）：

1. buildings = 17
2. building_profiles = 17
3. model_versions = 3
4. model_lods = 1
5. model_hotspots = 3
6. material_links = 8
7. knowledge_base = 10

## 14. Phase 2 回归测试结果（2026-03-28）

测试方式：

1. 启动 `DATA_SOURCE=postgres, PORT=9530`
2. 启动 `DATA_SOURCE=json, PORT=9531`
3. 对比同一批接口返回关键指标

对比接口：

1. `/api/health`
2. `/api/buildings`
3. `/api/buildings/gugong_01`
4. `/api/buildings/gugong_01/model3d`
5. `/api/buildings/gugong_01/model3d/manifest`
6. `/api/material?materialId=gugong_01`
7. `/api/knowledge`

结果：

1. health 数据集计数一致（10/8/17）
2. buildings 列表数量一致（17）
3. model3d 版本数量一致（1）
4. manifest 版本数量与 LOD 数量一致（1/1）
5. manifest 签名入口在双模式下均有效
6. 建筑详情关键字段一致（id/name/overview/model3d 核心字段）

结论：

1. Phase 2 双数据源切换功能完成
2. 核心接口返回结构与关键数据未出现回归

## 13. 候选清理清单（本轮已更新）

以下是“当前阶段可考虑删除/归档”的候选项，不建议立即删除核心 JSON 数据：

1. `backend/migrations/README.md` 里的过期描述
   - 原先“Phase 2 未接入”的描述已过期，可精简为当前状态
2. `backend/data/*.json`
   - 暂时不能删（当前仍保留 `DATA_SOURCE=json` 回滚能力）
   - 建议在 Phase 4 默认主读切到 PostgreSQL 且稳定观察后，再转为 seed 基线并归档

本轮说明：

1. `backend/src/config/database.js` 已被 `backend/app.js` 的 PostgreSQL 连接检查使用，不属于可删除项

## 15. Phase 3 自动化对比结果（2026-03-28）

执行命令：

1. `npm run test:phase3`

脚本行为：

1. 自动并行启动 `DATA_SOURCE=postgres (9530)` 与 `DATA_SOURCE=json (9531)`
2. 轮询健康检查，随后对以下接口进行采样对比：
   - `/api/health`
   - `/api/buildings`
   - `/api/buildings/gugong_01`
   - `/api/buildings/gugong_01/model3d`
   - `/api/buildings/gugong_01/model3d/manifest`
   - `/api/material?materialId=gugong_01`
   - `/api/knowledge`

自动化结果（全部通过）：

1. health 数据集计数一致（10/8/17）
2. buildings 列表数量一致（17）
3. model3d 与 manifest 版本/LOD 数一致（1/1）
4. manifest 在双模式下均返回签名入口 URL
5. detail 关键字段一致（id/name/overview/highlights/model3d 状态）

结论：

1. Phase 3 只读接口灰度对比已通过
2. 当前可以保持 `DATA_SOURCE=postgres` 作为默认建议值，同时保留 `json` 作为回滚开关
