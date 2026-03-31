# 古建筑AI导览项目 - Docker 部署指南

## 📋 项目架构

```
┌─────────────────────────────────────────────────────┐
│                   Nginx 反向代理                     │
│              (80 / 443 - Web 访问)                   │
└──────────────┬──────────────────────────────────────┘
               │
      ┌────────┴──────────┐
      │                   │
  ┌───▼────────┐   ┌─────▼──────┐
  │ 前端应用    │   │ 后端服务   │
  │ (H5/Web)   │   │ (Node.js)  │
  └────────────┘   └─────┬──────┘
                         │
                   ┌─────▼──────────┐
                   │  PostgreSQL    │
                   │  + pgvector    │
                   │ (向量数据库)    │
                   └────────────────┘
```

## 🐳 快速开始

### 1. **准备环境文件**

从模板创建实际的环境文件：

```bash
# 复制环境文件模板
cp .env.example .env
```

编辑 `.env` 文件，设置你的配置：

```env
DB_PASSWORD=your_secure_password
DASHSCOPE_API_KEY=your_api_key
CORS_ORIGIN=https://yourdomain.com
```

### 2. **前端构建** ⚠️ 重要

UNI-APP 项目需要先构建为静态文件才能在 Docker 中运行。

#### 选项 A：使用 HBuilderX 构建为 H5

1. 打开 HBuilderX
2. 打开该项目
3. 菜单：发行 → Web (H5) 或 访问网络
4. 等待构建完成，生成 `frontend/dist` 目录

#### 选项 B：使用命令行构建（需要提前配置）

```bash
cd frontend

# 方案 1：如果项目支持 npm build
npm install
npm run build

# 方案 2：使用 uni-cli（如果已安装）
npm install -g @dcloudio/uni-cli
uni build -p h5

# 方案 3：如果使用 Vite（现代 UNI-APP）
npm install
npm run build
```

构建完成后，你会看到 `frontend/dist` 目录。

### 3. **启动 Docker 容器**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 4. **验证服务**

```bash
# 检查容器状态
docker-compose ps

# 测试后端 API
curl http://localhost:3000/api/health

# 访问前端应用
http://localhost   # 或你配置的 WEB_PORT
```

## 📊 初始化数据库（可选）

如果要使用 PostgreSQL 而不是 JSON 数据源：

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行迁移脚本
npm run db:migrate
npm run db:seed

# 导入向量数据
npm run import:vectors
```

## 🔧 常用命令

```bash
# 停止所有服务
docker-compose down

# 停止并删除所有数据（谨慎！）
docker-compose down -v

# 重启服务
docker-compose restart

# 重建镜像（修改代码后）
docker-compose build --no-cache
docker-compose up -d

# 进入后端容器执行命令
docker-compose exec backend npm run test:embedding

# 查看数据库
docker-compose exec postgres psql -U postgres -d ancient_architecture
```

## 🚀 生产部署建议

### 1. **SSL/TLS 配置**

为 Nginx 添加 SSL 支持：

```bash
# 生成自签名证书（用于测试）
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/private.key \
  -out certs/certificate.crt

# 或使用 Let's Encrypt（推荐用于生产）
# 需要配置 Certbot
```

在 `docker-compose.yml` 中取消注释：

```yaml
volumes:
  - ./certs:/etc/nginx/certs:ro
```

### 2. **环境变量安全**

```bash
# 使用 Docker secrets（Swarm 模式）
echo "your_secret_password" | docker secret create db_password -

# 或在 docker-compose 中使用文件
cat .env | grep -v "^#" > .env.prod
```

### 3. **数据持久化**

所有重要数据已通过 volumes 持久化：

- PostgreSQL 数据：`postgres_data` 卷
- 日志文件：`./logs/backend` 目录
- 静态文件：`./frontend/dist` 目录

### 4. **监控和健康检查**

所有服务都配置了 `healthcheck`。可以添加监控：

```bash
# 使用 docker stats 监控资源使用
docker stats

# 查看容器事件
docker events
```

### 5. **扩展到多台服务器（Docker Swarm）**

```bash
# 初始化 Swarm
docker swarm init

# 部署堆栈
docker stack deploy -c docker-compose.yml ancient-arch

# 查看状态
docker stack services ancient-arch
```

## 📝 前端部署具体步骤

### 情景 1：在 HBuilderX 中部署

1. **项目配置**
   - 打开 `manifest.json`
   - 配置应用名称、版本、API 地址

2. **构建 Web**

   ```
   菜单 → 发行 → Web(H5)
   选择构建配置（生产/开发）
   点击发行
   ```

3. **部署到服务器**
   ```bash
   # 上传 dist 文件夹内容到服务器
   scp -r frontend/dist/* user@server:/var/www/html/
   ```

### 情景 2：使用 Docker 部署（推荐）

```bash
# 1. 在本地构建
npm run build  # 或 HBuilderX 构建

# 2. 启动 Docker
docker-compose up -d

# 3. 访问
http://your-server-ip:80
```

### 情景 3：混合部署（前端单独部署）

```bash
# 后端在 Docker 中
docker-compose up -d postgres backend

# 前端在其他服务器（如 Nginx/Apache）
# 配置前端 API_BASE_URL 指向后端地址
```

## 🐛 故障排查

### 问题 1：前端无法连接到后端 API

```bash
# 检查后端服务状态
docker-compose logs backend

# 检查 CORS 配置
# 编辑 .env，设置 CORS_ORIGIN 为前端地址
CORS_ORIGIN=http://your-frontend-domain

# 重启后端
docker-compose restart backend
```

### 问题 2：数据库连接失败

```bash
# 检查数据库容器
docker-compose logs postgres

# 检查环境变量
docker-compose config | grep DATABASE_URL

# 手动测试连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### 问题 3：前端找不到 dist 文件

```bash
# 确保已构建
ls -la frontend/dist/

# 如果不存在，需要在本地先构建
# HBuilderX: 发行 → Web(H5) 或 使用 npm run build
```

### 问题 4：性能问题

```bash
# 检查资源使用
docker stats

# 增加数据库连接池
# 编辑 .env
DB_POOL_MAX=30

# 重启服务
docker-compose restart
```

## 📦 备份和恢复

### 备份数据库

```bash
# 导出数据库
docker-compose exec postgres pg_dump -U postgres ancient_architecture > backup.sql

# 导出全部数据
docker-compose exec postgres pg_dumpall -U postgres > full_backup.sql
```

### 恢复数据库

```bash
# 从备份恢复
docker-compose exec -T postgres psql -U postgres < backup.sql

# 或
docker-compose exec postgres psql -U postgres ancient_architecture < backup.sql
```

## 🔒 安全建议

1. **修改默认密码**

   ```bash
   # 编辑 .env，使用强密码
   DB_PASSWORD=your_very_secure_password_here
   ```

2. **限制数据库访问**

   ```bash
   # 不暴露 PostgreSQL 端口到互联网级别
   # 在 docker-compose.yml 中改为内部通信
   ports:
     - "127.0.0.1:5432:5432"  # 只限本地
   ```

3. **使用 HTTPS**
   - 配置 SSL 证书
   - 重定向 HTTP 到 HTTPS

4. **定期更新镜像**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## 📞 如何在服务器上运行

### 前置条件

- 已安装 Docker 和 Docker Compose
- 服务器开放必要的端口（80、443、3000 可选）

### 完整部署流程

```bash
# 1. 克隆项目到服务器
git clone <repo-url> /home/user/ancient-arch
cd /home/user/ancient-arch

# 2. 构建前端（在本地或服务器）
# 如果在本地构建：
# HBuilderX 中发行 → Web(H5)
# 然后上传 frontend/dist

# 3. 如果在服务器构建
# npm install
# npm run build  # （如果支持）

# 4. 准备环境
cp .env.example .env
# 编辑 .env 配置实际参数

# 5. 启动服务
docker-compose up -d

# 6. 验证
docker-compose ps
curl http://localhost/api/health

# 7. 配置反向代理（可选，如果已有其他服务）
# 在 Nginx 或 Apache 中配置指向本容器
```

## 📋 清单

- [ ] 已准备 `.env` 文件
- [ ] 已在本地构建前端 (`frontend/dist` 存在)
- [ ] 已运行 `docker-compose up -d`
- [ ] 已验证后端健康检查通过
- [ ] 已验证前端能加载
- [ ] 已配置 API 连接
- [ ] 已配置备份策略
- [ ] 已配置监控告警

## 🎯 下一步

1. **性能优化**
   - 配置 CDN 加速静态资源
   - 优化数据库查询
   - 启用缓存

2. **自动化**
   - 配置 CI/CD 自动部署
   - 设置监控告警
   - 配置日志聚合

3. **扩展**
   - 多实例部署
   - 负载均衡配置
   - 容器编排（Kubernetes）
