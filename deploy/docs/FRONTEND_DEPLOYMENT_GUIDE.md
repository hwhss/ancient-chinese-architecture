# 前端部署指南 - UNI-APP 项目

## 🎯 核心问题解答

### Q1: 前端为什么需要 HBuilderX？

**A:** 这个项目使用的是 **UNI-APP** 框架（基于 Vue），它是跨平台开发框架，支持：

- ✅ iOS/Android 应用
- ✅ 小程序（微信、支付宝等）
- ✅ H5 网页
- ✅ 快应用、PC 等

HBuilderX 是官方 IDE，提供：- 快速编译和预览

- 打包成各种格式
- 深度框架集成

---

## 📦 前端部署方案

### 方案 1: **Docker 部署（推荐 ⭐）**

适用于服务器统一管理，最简单的方式。

#### 步骤：

**1. 在本地构建前端**

```bash
# 方法 A: 使用 HBuilderX
# - 打开 HBuilderX
# - 打开项目
# - 菜单: 发行 → Web(H5)
# - 等待构建完成
# - 会生成 frontend/dist 文件夹

# 方法 B: 命令行构建（如果配置支持）
cd frontend
npm install
npm run build  # 或 uni build -p h5
```

**2. 上传到服务器**

```bash
# 上传整个项目到服务器
scp -r . user@your-server:/path/to/project/

# 或者仅上传前端构建的文件
scp -r frontend/dist/* user@your-server:/path/to/project/frontend/dist/
```

**3. 在服务器启动 Docker**

```bash
cd /path/to/project
cp .env.example .env
# 编辑 .env 配置

docker-compose up -d
```

**4. 访问应用**

```
http://your-server-ip/
```

---

### 方案 2: **分离部署（当前后端和前端在不同服务器）**

#### 后端部署：

```bash
# 在后端服务器（Docker 中）
docker-compose up -d postgres backend

# 后端运行在 http://backend-server:3000
```

#### 前端部署：

```bash
# 本地构建（HBuilderX 或 npm）
# 生成 frontend/dist

# 选项 A: 部署到 Nginx/Apache
scp -r frontend/dist/* user@frontend-server:/var/www/html/

# 选项 B: 部署到 Vercel/GitHub Pages/阿里云
# 参考对应平台的部署文档
```

#### 配置前端 API 地址：

编辑 `frontend/services/api.js`：

```javascript
// 配置 API 基地址
const API_BASE =
  process.env.VUE_APP_API_BASE || "http://backend-server:3000/api";

// 或在前端构建时设置环境变量
// VUE_APP_API_BASE=http://backend-server:3000/api npm run build
```

---

### 方案 3: **HBuilderX 云端打包（用于移动应用）**

如果需要构建 iOS/Android 应用：

1. **在 HBuilderX 中：**
   - 菜单: 发行 → 原生 App 云端打包
   - 选择打包平台（iOS/Android）
   - 配置应用基本信息
   - 等待打包完成

2. **生成的 App 中：**
   - 后端 API 地址需要配置为服务器地址
   - 通常需要在配置文件或环境变量中设置

---

## 🚀 最快部署（3 步启动）

### 前提：Docker 已安装

```bash
# 步骤 1: 使用 HBuilderX 构建前端
# - 打开 HBuilderX
# - 打开项目
# - 发行 → Web(H5)
# - 等待完成

# 步骤 2: 配置环境
cd 项目目录
cp .env.example .env
# 编辑 .env 中的 DB_PASSWORD 等

# 步骤 3: 启动
docker-compose up -d

# 访问
open http://localhost    # Mac/Linux
start http://localhost   # Windows
```

完成！🎉

---

## 🔧 常见问题

### Q: 还是不想用 HBuilderX，有其他办法吗？

**A:** 有，但需要配置环境：

```bash
# 安装 uni-cli
npm install -g @dcloudio/uni-cli

# 或安装 Vue CLI
npm install -g @vue/cli

# 构建
cd frontend
npm install
uni build -p h5  # 或 npm run build
```

但这需要确保项目配置支持这种方式。如果失败，最稳妥还是用 HBuilderX。

---

### Q: 前端在哪里配置后端地址？

**A:** 编辑 [frontend/services/api.js](frontend/services/api.js)：

```javascript
// 找到 API 基地址配置
const API_BASE = "http://localhost:3000/api"; // 开发环境
// 生产环境配置为你的服务器地址
const API_BASE = "http://your-server:3000/api";
```

或在 `.env` 中配置：

```env
VUE_APP_API_BASE=http://your-server:3000/api
```

---

### Q: Docker 中前端如何访问后端 API？

**A:** Docker 内部网络通信：

```yaml
# docker-compose.yml 中已配置：
# - Nginx 代理 /api/* 到后端
# - 前端代码简单地使用 /api/...

location /api/ {
proxy_pass http://backend:3000;
}
```

所以前端可以直接请求相对路径：

```javascript
fetch('/api/buildings')   # ✅ 自动转发到后端
```

---

### Q: 想要在服务器上跑，但没有 HBuilderX

**A:** 两个选择：

1. **在本地用 HBuilderX 构建，然后上传**

   ```bash
   # 本地
   # 用 HBuilderX 构建 → 生成 frontend/dist
   scp -r frontend/dist/* server:/path/dist/
   ```

2. **用 Docker 多阶段构建**
   - 创建新的前端 Dockerfile 基于 Node.js
   - 看下面的示例

---

## 📝 (可选) 前端 Dockerfile 示例

如果想在 Docker 中直接构建前端（不用 HBuilderX）：

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine as builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

# 构建（需要项目支持）
RUN npm run build

# 生成的静态文件在 /app/dist

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx-default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

使用方式：

```bash
docker build -f Dockerfile.frontend -t ancient-arch-frontend:latest .
docker run -p 8080:80 ancient-arch-frontend:latest
```

---

## 📊 部署架构对比

| 方案                    | 复杂度   | 维护成本 | 适用场景          | 部署时间 |
| ----------------------- | -------- | -------- | ----------------- | -------- |
| **Docker 全套**         | ⭐⭐⭐   | 低       | 专业部署、自动化  | 30 分钟  |
| **分离部署**            | ⭐⭐⭐⭐ | 中       | 前后端分开迭代    | 1 小时   |
| **Vercel/GitHub Pages** | ⭐⭐     | 低       | 免费托管、演示    | 5 分钟   |
| **传统/服务器**         | ⭐⭐⭐⭐ | 高       | 已有 Nginx/Apache | 1 小时   |

---

## ✅ 检查清单

- [ ] 已在 HBuilderX 中构建前端 (`frontend/dist` 存在)
- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已编辑 `.env` 配置密码和 API Key
- [ ] 已运行 `docker-compose up -d`
- [ ] 已验证后端健康: `curl http://localhost:3000/api/health` 返回 200
- [ ] 已访问前端: `http://localhost` 成功加载
- [ ] 已配置前端 API 地址指向后端

---

## 🎯 推荐流程

```
HBuilderX 构建前端 dist
         ↓
   上传到服务器
         ↓
  运行 docker-compose up -d
         ↓
   验证服务运行
         ↓
  配置 API 地址
         ↓
   访问应用
         ↓
   完成！🎉
```

有问题随时询问！
