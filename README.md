# 🏯 古建筑AI导览

一个基于 UniApp + Vue3 + Node.js 的古建筑智能导览应用，提供AI问答和实景/动画素材展示功能。

## ✨ 功能特性

- 🤖 **AI智能问答** - 基于本地知识库 + AI API，解答古建筑相关问题
- 🖼️ **实景/动画展示** - 图文结合，沉浸式体验古建筑魅力
- 💬 **对话式交互** - 自然语言提问，即时获取答案
- 📱 **跨平台支持** - 基于UniApp，支持H5、小程序、App多端运行

## 🛠️ 技术栈

### 前端

- **UniApp** - 跨端应用框架
- **Vue3** - 前端框架

### 后端

- **Node.js** - 运行环境
- **Express** - Web框架
- **AI API** - Kimi/豆包大模型接口

## 📁 项目结构

```
.
├── agent.md                    # Agent开发规范
├── docs/                       # 开发文档
│   ├── 古建筑AI导览项目_每日任务清单-09edf513b1.md
│   └── 2026-03-26_项目初始化与雏形搭建.md
├── frontend/                   # UniApp前端
│   ├── manifest.json
│   ├── pages.json
│   ├── App.vue
│   ├── main.js
│   ├── pages/
│   │   ├── index/index.vue     # 首页-聊天界面
│   │   └── detail/detail.vue   # 详情页-素材展示
│   └── static/                 # 静态资源
├── backend/                    # Node.js后端
│   ├── package.json
│   ├── app.js                  # 服务入口
│   ├── services/
│   │   └── aiService.js        # AI服务封装
│   ├── data-jsondb/            # 主数据源（分文件JSON数据库）
│   │   ├── index.json
│   │   ├── buildings/
│   │   ├── knowledge/
│   │   └── visualization/
│   └── data/                   # 兼容回退数据目录（legacy）
└── README.md                   # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- HBuilder X（UniApp开发工具）

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd ancient-chinese-architecture
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量模板（首次）
cp .env.example .env

# 启动服务
npm start
```

服务将运行在 `http://localhost:9527`（好记不冲突）

### 2.1 PostgreSQL 初始化（已安装 PG 时）

```bash
# 一键执行：建表 + 导入 JSON 数据
npm run db:setup
```

等价分步命令：

```bash
npm run db:migrate
npm run db:seed
```

注意：

1. 若 `db:setup` 失败并提示 `Password authentication failed`，请修改 `.env` 中 `DATABASE_URL` 的用户名/密码。
2. 若 `npm start` 失败并提示 `EADDRINUSE`，表示 `9527` 端口被占用，需结束占用进程或调整 `PORT`。

### 2.2 启动模式说明

后端启动时会读取 `.env`：

1. `DATA_SOURCE=json`：接口优先从 `backend/data-jsondb` 读取；若未找到则回退到 `backend/data`。
2. `DATA_SOURCE=postgres`：接口从 PostgreSQL 读取（Phase 2 已完成）。

新增配置：

1. `DATA_JSON_DB_DIR`：JSON 数据库目录，默认值为 `data-jsondb`。

当前结论（2026-03-28）：

1. PostgreSQL 建表和 seed 已可执行并已实测通过。
2. 仓储层已支持 `DATA_SOURCE=json|postgres` 双模式切换。
3. 在 `json` 与 `postgres` 双模式下，核心接口返回已完成一致性回归。

当前补充（2026-03-31）：

1. 已接入分文件 JSON 数据库（`backend/data-jsondb`），用于前端可视化与知识检索主链路。
2. 在不启用向量数据库时，仍可通过关键词检索稳定回答古建筑问题。

相关迁移文档：

1. `backend/migrations/README.md`
2. `docs/2026-03-28_PostgreSQL迁移计划草案.md`

### 2.3 快速回滚说明（postgres -> json）

当你需要临时回滚到 JSON 数据源时，可按下面步骤执行：

```bash
# 1) 停掉当前后端进程
# 2) 修改 backend/.env
DATA_SOURCE=json

# 3) 重启后端
cd backend
npm start
```

回滚后验证：

1. 启动日志出现 `DATA_SOURCE: json`。
2. 访问 `/api/health` 返回 `datasets` 正常。
3. 如需做一致性确认，可再次执行 `npm run test:phase3`（json 与 postgres 对比）。

恢复到 PostgreSQL 只需把 `.env` 改回：

```bash
DATA_SOURCE=postgres
```

### 2.4 向量相关脚本说明（可选）

以下脚本仅在你明确启用 PostgreSQL + pgvector 后才需要：

1. `npm run test:embedding`
2. `npm run import:vectors`
3. `npm run query:vectors`

如果当前采用纯 JSON 数据源（`DATA_SOURCE=json`），上述脚本可以不执行，不影响前端可视化与基础问答能力。

**接口列表：**
| 接口 | 方法 | 说明 |
|------|------|------|
| `/test` | GET | 服务状态测试 |
| `/api/chat` | POST | AI问答接口 |
| `/api/material` | GET | 素材查询接口 |

### 3. 运行前端项目

使用 **HBuilder X** 打开 `frontend` 目录：

1. 打开 HBuilder X
2. 文件 → 打开目录 → 选择 `frontend` 文件夹
3. 运行 → 运行到浏览器 → 选择 Chrome
4. 等待编译完成，自动打开浏览器

> 首次运行可能需要安装 UniApp 插件，按提示操作即可。

### 4. 测试功能

1. 在首页输入框中提问，例如：
   - "太和殿的历史是什么？"
   - "故宫是什么时候建成的？"
   - "乾清宫有什么特色？"

2. AI回复后，点击 **"查看实景/动画"** 按钮

3. 跳转到详情页查看素材

## ⚙️ 配置AI API（可选）

项目默认使用 Mock 数据，如需接入真实 AI API：

1. 注册 [Kimi AI](https://platform.moonshot.cn/) 或 [豆包AI](https://www.volcengine.com/docs/82379) 开发者账号
2. 获取 API Key
3. 修改 `backend/services/aiService.js` 中的配置：

```javascript
const KIMI_CONFIG = {
  apiKey: "your_api_key_here", // 替换为你的API Key
  apiUrl: "https://api.moonshot.cn/v1/chat/completions",
  model: "moonshot-v1-8k",
};
```

## 📝 开发记录

- [2026-03-26] 项目初始化，搭建前后端框架，实现基础问答功能

## 📄 许可证

本项目仅用于学习和比赛展示。

---

**中华优秀传统文化系列之六**
