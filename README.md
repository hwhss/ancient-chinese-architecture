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
│   └── data/
│       ├── knowledge_base.json # 知识库数据
│       └── material_links.json # 素材链接
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

# 启动服务
npm start
```

服务将运行在 `http://localhost:8080`

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
  apiKey: 'your_api_key_here',  // 替换为你的API Key
  apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
  model: 'moonshot-v1-8k'
};
```

## 📝 开发记录

- [2026-03-26] 项目初始化，搭建前后端框架，实现基础问答功能

## 📄 许可证

本项目仅用于学习和比赛展示。

---

**中华优秀传统文化系列之六**
