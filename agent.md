# 🤖 Agent 开发规范

## 项目概述
古建筑AI导览项目 - MVP版，基于UniApp+Vue3前端和Node.js+Express后端。

## 开发原则

### 1. 文档记录
- 每次有意义的调整都应在 `docs/` 目录下创建记录文档
- 文档命名格式：`YYYY-MM-DD_调整简述.md`
- 什么值得记录：
  - ✅ 新增功能模块
  - ✅ 架构调整
  - ✅ 重要Bug修复
  - ✅ 接口变更
- 什么不值得记录：
  - ❌ 简单的样式微调
  - ❌ 变量名修改
  - ❌ 格式化代码
  - ❌ 单行的console.log添加/删除

### 2. 代码规范

#### 前端 (UniApp + Vue3)
- 使用Options API风格（当前项目）
- 组件命名使用PascalCase
- 方法命名使用camelCase
- 常量使用UPPER_SNAKE_CASE

#### 后端 (Node.js + Express)
- 使用async/await处理异步
- API返回统一格式：`{ code, msg, data }`
- 错误处理：try-catch + 统一错误响应
- 路由命名使用kebab-case

### 3. 目录结构
```
.
├── agent.md                          # 本文件
├── docs/                             # 开发文档
├── frontend/                         # UniApp前端
│   ├── manifest.json
│   ├── pages.json
│   ├── App.vue
│   ├── main.js
│   ├── pages/
│   │   ├── index/index.vue           # 首页-聊天
│   │   └── detail/detail.vue         # 详情页
│   └── static/
└── backend/                          # Node.js后端
    ├── package.json
    ├── app.js
    ├── services/
    │   └── aiService.js
    └── data/
        ├── knowledge_base.json
        └── material_links.json
```

### 4. 接口规范
- 前缀：`/api/`
- 方法：GET查询，POST提交
- 状态码：200成功，400参数错误，500服务器错误

## 当前状态
- [x] 项目初始化
- [x] 目录结构创建
- [x] 前端框架搭建（UniApp + Vue3）
- [x] 后端服务搭建（Express）
- [x] AI接口对接（含Mock模式）
- [x] 素材系统实现

## 快速开始

### 1. 启动后端
```bash
cd backend
npm install
npm start
```
服务将运行在 http://localhost:3000

### 2. 运行前端
使用 HBuilderX 打开 `frontend` 目录：
- 文件 → 打开目录 → 选择 frontend
- 运行 → 运行到浏览器 → Chrome

### 3. 测试功能
- 首页输入问题，如"太和殿的历史是什么？"
- 点击"查看实景/动画"按钮跳转到详情页

## 接口列表
| 接口 | 方法 | 说明 |
|------|------|------|
| /test | GET | 服务状态测试 |
| /api/chat | POST | AI问答接口 |
| /api/material | GET | 素材查询接口 |

## 开发记录
- [2026-03-26_项目初始化与雏形搭建](./docs/2026-03-26_项目初始化与雏形搭建.md)
