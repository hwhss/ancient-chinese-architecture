# 📦 Docker 完整部署方案总结

## ✅ 已为你生成的所有文件

```
项目根目录/
├── 📍 docker-compose.yml          ← 核心文件：定义所有容器和服务
├── 📍 .env.example                ← 环境变量模板（先复制为 .env）
├── 📍 nginx.conf                  ← Nginx 主配置
├── 📍 nginx-default.conf          ← Nginx 应用配置
│
├── backend/
│   └── 📍 Dockerfile              ← 后端镜像构建脚本
│
├── 🚀 快速启动脚本（选择一个）:
│   ├── start-docker.bat           ← Windows 用户的菜单脚本
│   ├── start-docker.sh            ← Mac/Linux 用户的脚本
│   ├── docker-start.ps1           ← PowerShell 脚本（高级）
│   └── Makefile                   ← Make 命令（开发者用）
│
├── 📚 完整指南文档:
│   ├── DOCKER_DEPLOYMENT_GUIDE.md ← 最详细的部署指南（强烈推荐读）
│   ├── FRONTEND_DEPLOYMENT_GUIDE.md ← 前端部署专项指南
│   ├── QUICK_START.md             ← 快速参考卡
│   └── README_DOCKER.md           ← 此文件
```

## 🎯 项目架构

```
┌─────────────────────────────────────────────┐
│         Docker Compose 编排                 │
└─────────────────────────────────────────────┘
         │            │           │
         ▼            ▼           ▼
    ┌────────┐  ┌──────────┐  ┌──────────┐
    │ Nginx  │  │ Node.js  │  │PostgreSQL│
    │  Web   │  │  后端    │  │ + Vector │
    │(H5)   │  │  3000    │  │  DB      │
    └───┬────┘  └───┬──────┘  └──────┬───┘
        │          │                │
        └──────────┴────────────────┘
         内部网络: ancient-arch-network
```

## 📂 文件说明和用途

### 核心容器配置

| 文件                 | 用途                   | 修改频率       |
| -------------------- | ---------------------- | -------------- |
| `docker-compose.yml` | 定义所有容器、网络、卷 | 低（设置阶段） |
| `backend/Dockerfile` | 打包后端应用           | 低             |
| `nginx.conf`         | Nginx 全局配置         | 低             |
| `nginx-default.conf` | Nginx 站点配置         | 中等           |
| `.env`               | 敏感配置和密码         | 中等           |

### 启动脚本

| 脚本               | 平台               | 特点               | 何时使用                |
| ------------------ | ------------------ | ------------------ | ----------------------- |
| `start-docker.bat` | Windows            | 菜单风格，简单易用 | **推荐 Windows 用户**   |
| `start-docker.sh`  | Mac/Linux          | 菜单风格           | **推荐 Mac/Linux 用户** |
| `docker-start.ps1` | Windows PowerShell | 功能富，可传参     | 高级用户                |
| `Makefile`         | Linux/Mac          | 标准命令行         | 开发者                  |

### 文档指南

| 文档                           | 内容                   | 何时阅读              |
| ------------------------------ | ---------------------- | --------------------- |
| `QUICK_START.md`               | 5分钟快速指南          | **第一次部署**        |
| `DOCKER_DEPLOYMENT_GUIDE.md`   | 完整部署说明（60+ KB） | 需要深入理解时        |
| `FRONTEND_DEPLOYMENT_GUIDE.md` | 前端构建和部署详解     | 关于 HBuilderX 和前端 |

## 🚀 最简快速开始（3 步）

### Windows 用户

```batch
REM 1. 用 HBuilderX 构建前端（已有 frontend\dist）
REM    发行 → Web(H5)

REM 2. 运行启动脚本
start-docker.bat

REM 3. 选择 "1 - 启动所有服务"

REM 4. 等待 1 分钟后访问 http://localhost
```

### Mac/Linux 用户

```bash
# 1. 用 HBuilderX 构建前端（已有 frontend/dist）
#    发行 → Web(H5)

# 2. 运行启动脚本
bash start-docker.sh

# 3. 选择 "1 - 启动所有服务"

# 4. 立即访问 http://localhost
```

### 命令行用户（不使用菜单脚本）

```bash
# 1. 确保前端已构建（frontend/dist 存在）

# 2. 复制环境配置
cp .env.example .env

# 3. 编辑 .env 配置密码
# 编辑器打开 .env，设置:
#   DB_PASSWORD=your_secure_password
#   DASHSCOPE_API_KEY=your_api_key

# 4. 启动所有容器
docker-compose up -d

# 5. 等待服务启动（查看日志）
docker-compose logs -f

# 6. 访问
# 前端: http://localhost
# API: http://localhost:3000
# 健康检查: http://localhost:3000/api/health
```

## 🔑 关键概念

### Docker Compose 定义的 4 个主要服务

#### 1️⃣ **PostgreSQL 数据库**

```yaml
container_name: ancient-arch-postgres
image: pgvector/pgvector:pg16-latest
ports: 5432
volumes: postgres_data (持久化)
```

- **用途：** 存储所有业务数据和向量数据
- **访问：** 仅限内部网络（不暴露到外网）
- **备份：** `docker-compose exec postgres pg_dump ...`

#### 2️⃣ **Node.js 后端**

```yaml
container_name: ancient-arch-backend
build: ./backend/Dockerfile
ports: 3000
depends_on: postgres
```

- **用途：** 运行 REST API 服务
- **启动脚本：** `npm start` (app.js)
- **热更新：** 修改代码后需要重启: `docker-compose restart backend`

#### 3️⃣ **Nginx 反向代理 + 前端**

```yaml
container_name: ancient-arch-web
image: nginx:alpine
ports: 80, 443
volumes:
  - ./frontend/dist (前端静态文件)
  - ./nginx.conf (配置)
```

- **用途：** 提供 Web 访问，代理 API 请求到后端
- **功能：**
  - 提供前端应用（SPA）
  - 自动代理 `/api/*` 到后端
  - 启用 Gzip 压缩

## ⚙️ 环境变量配置

### 必需配置（一定要改）

```env
# 数据库
DB_PASSWORD=your_secure_password          # 改成强密码！
DB_NAME=ancient_architecture

# AI 服务
DASHSCOPE_API_KEY=your_api_key_here       # 从阿里云获取

# 前端跨域
CORS_ORIGIN=http://localhost              # 生产改为前端地址
```

### 可选配置（根据需求）

```env
# 数据源选择
DATA_SOURCE=json                          # 或 postgres

# 性能调优
DB_POOL_MAX=20                            # 增大可提高并发

# 日志级别
LOG_LEVEL=info                            # 或 debug
```

## 🔍 故障排查

### ❌ "前端一片空白"

**原因：** `frontend/dist` 不存在

**解决：**

```bash
# 用 HBuilderX 构建
# 菜单: 发行 → Web(H5)

# 或命令行（如果支持）
cd frontend && npm run build
```

### ❌ "无法连接后端 API"

**检查步骤：**

```bash
# 1. 检查后端是否运行
curl http://localhost:3000/api/health

# 2. 查看日志
docker-compose logs backend

# 3. 检查 CORS 配置
# 编辑 .env: CORS_ORIGIN=http://localhost

# 4. 重启后端
docker-compose restart backend
```

### ❌ "数据库连接吗失败"

**检查步骤：**

```bash
# 1. 检查数据库是否运行
docker-compose ps

# 2. 查看数据库日志
docker-compose logs postgres

# 3. 验证连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# 4. 检查密码是否正确
# 编辑 .env，确保 DB_PASSWORD 一致
```

### ❌ "端口已占用"

**错误示例：** `Error: bind: address already in use`

**解决：**

```bash
# 方法 1: 修改 .env 中的端口
WEB_PORT=8080          # 改成 8080 而不是 80
BACKEND_PORT=3001      # 改成 3001 而不是 3000

# 方法 2: 杀死占用端口的进程
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

## 📊 常用命令速查

```bash
# 基础操作
docker-compose up -d                      # 启动
docker-compose down                       # 停止
docker-compose restart                    # 重启
docker-compose ps                         # 查看状态

# 日志
docker-compose logs -f                    # 所有日志
docker-compose logs -f backend            # 后端日志
docker-compose logs -f postgres           # DB 日志

# 开发调试
docker-compose exec backend sh             # 进入后端容器
docker-compose exec backend npm run test:embedding  # 运行测试

# 数据库
docker-compose exec postgres psql -U postgres  # 进入数据库
docker-compose exec postgres pg_dump -U postgres ancient_architecture > backup.sql

# 性能监控
docker stats                              # 实时监控
docker-compose ps --services              # 列出所有服务
```

## 📝 生产部署检查清单

- [ ] 已修改 `.env` 中的所有密码（DB_PASSWORD）
- [ ] 已设置 DASHSCOPE_API_KEY
- [ ] 已修改 CORS_ORIGIN 为生产域名
- [ ] 已配置 SSL/TLS 证书
- [ ] 已限制 PostgreSQL 端口（仅内部）
- [ ] 已启用备份策略（定时备份数据库）
- [ ] 已配置日志搜集和轮转
- [ ] 已设置监控告警
- [ ] 已测试 API 和前端功能
- [ ] 已配置自动更新和回滚策略

## 🎓 下一步学习资源

1. **官方文档**
   - Docker 官方: https://docs.docker.com/
   - Docker Compose: https://docs.docker.com/compose/
   - PostgreSQL: https://www.postgresql.org/docs/

2. **本项目文档**
   - 详翻 `DOCKER_DEPLOYMENT_GUIDE.md`（涵盖所有细节）
   - 前端部分查看 `FRONTEND_DEPLOYMENT_GUIDE.md`

3. **容器编排进阶**
   - Docker Swarm（多机部署）
   - Kubernetes（企业级编排）

## 💡 小技巧

### 快速重新构建后端

```bash
# 如果修改了后端代码，需要重新构建镜像
docker-compose build backend --no-cache
docker-compose up -d backend
```

### 导出和导入镜像

```bash
# 导出镜像（用于离线部署）
docker save ancient-arch-backend:latest > backend.tar

# 导入镜像
docker load < backend.tar
```

### 在线编辑配置

```bash
# 使用容器提供的编辑器修改配置
docker-compose exec backend vi /app/.env
```

### 数据库快速初始化

```bash
# 一键初始化所有数据
docker-compose exec backend npm run db:setup
```

## 🎯 推荐的文档阅读顺序

```
1️⃣  QUICK_START.md
    ↓
2️⃣  FRONTEND_DEPLOYMENT_GUIDE.md
    ↓
3️⃣  DOCKER_DEPLOYMENT_GUIDE.md（遇到问题时）
    ↓
4️⃣  Dockerfile/docker-compose.yml 源代码
```

## 🔗 快速链接

| 资源                | 链接                                           |
| ------------------- | ---------------------------------------------- |
| Docker Desktop 下载 | https://www.docker.com/products/docker-desktop |
| HBuilderX 下载      | https://www.dcloud.io/hbuilderx.html           |
| DashScope API       | https://dashscope.aliyun.com/                  |
| PostgreSQL 向量查询 | https://github.com/pgvector/pgvector           |

## ❓ 常见问题总结

| 问题                   | 答案                      | 查看文档                     |
| ---------------------- | ------------------------- | ---------------------------- |
| 为什么需要 HBuilderX？ | UNI-APP 框架需要编译      | FRONTEND_DEPLOYMENT_GUIDE.md |
| 如何在服务器上运行？   | Docker Compose 或直接部署 | DOCKER_DEPLOYMENT_GUIDE.md   |
| 如何备份数据？         | pg_dump 导出 SQL          | 本文查找 `db-backup`         |
| 如何扩展到多个节点？   | 使用 Docker Swarm         | 官方文档                     |

---

## 📞 需要帮助？

1. **查看日志** - 90% 的问题都在日志中

   ```bash
   docker-compose logs -f
   ```

2. **查看文档** - 详细的指南已提供

   ```bash
   DOCKER_DEPLOYMENT_GUIDE.md
   ```

3. **测试基础功能**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 🎉 总结

你现在拥有：

- ✅ 完整的 Docker 部署配置
- ✅ 多种启动脚本（菜单、命令行、PowerShell）
- ✅ 详细的部署文档和故障排查指南
- ✅ 前端和后端的完整部署方案
- ✅ 生产环境最佳实践建议

**立即开始：**运行 `start-docker.bat` （Windows）或 `start-docker.sh` （Mac/Linux）！

🚀 祝部署顺利！
