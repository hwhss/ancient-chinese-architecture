# 服务器部署完整命令清单

## 📋 一键部署命令（推荐 ⭐）

### Option 1: 从 GitHub 克隆并部署

```bash
# 1️⃣ 克隆项目到服务器
git clone <your-repo-url> /opt/ancient-architecture
cd /opt/ancient-architecture

# 2️⃣ 一键启动（自动化所有步骤）
# Linux/Mac
bash deploy.sh

# Windows
deploy.bat
```

### Option 2: 手动步骤（适合理解过程）

```bash
# 1️⃣ 克隆项目
git clone <your-repo-url> /opt/ancient-architecture
cd /opt/ancient-architecture

# 2️⃣ 配置环境
cp .env.example .env

# 编辑 .env，修改关键参数：
# - DB_PASSWORD=your_secure_password
# - DASHSCOPE_API_KEY=your_api_key

# 3️⃣ 启动所有服务
docker-compose up -d

# 4️⃣ 验证
docker-compose ps
curl http://localhost:3000/api/health
```

---

## 🔧 详细的 Git 克隆命令

### 替换为你的实际仓库地址：

```bash
# HTTPS 方式
git clone https://github.com/your-username/ancient-chinese-architecture.git

# SSH 方式（需要配置 SSH Key）
git clone git@github.com:your-username/ancient-chinese-architecture.git

# 克隆后进入项目
cd ancient-chinese-architecture
```

### 指定克隆到特定目录：

```bash
# 克隆到 /opt/ancient-architecture
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-architecture

# 或克隆到当前目录的项目文件夹
git clone https://github.com/your-username/ancient-chinese-architecture.git ./ancient-arch-deploy
```

---

## 📦 完整的服务器部署流程

### 第一次部署（从零开始）

```bash
# Step 1: 连接到服务器
ssh user@your-server

# Step 2: 克隆项目
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch
cd /opt/ancient-arch

# Step 3: 一键部署（自动处理后续）
bash deploy.sh

# 或手动部署
cp .env.example .env
# 编辑 .env
nano .env

# 启动
docker-compose up -d

# Step 4: 验证
docker-compose ps
curl http://localhost/api/health   # 测试前端
curl http://localhost:3000/api/health  # 测试后端
```

### 后续更新（已部署过）

```bash
# 进入项目目录
cd /opt/ancient-arch

# 拉取最新代码
git pull origin main

# 重新构建和启动
docker-compose build
docker-compose up -d

# 验证
docker-compose logs -f
```

---

## 🚀 快速部署脚本（可复制到终端）

### Linux/Mac 用户：一行命令启动

```bash
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch && \
cd /opt/ancient-arch && \
bash deploy.sh
```

### 分步脚本（更安全）

```bash
#!/bin/bash
REPO_URL="https://github.com/your-username/ancient-chinese-architecture.git"
DEPLOY_DIR="/opt/ancient-architecture"

# 克隆
git clone $REPO_URL $DEPLOY_DIR
cd $DEPLOY_DIR

# 配置
cp .env.example .env

# 提示编辑 .env
echo "⚠️  请编辑 .env 文件中的 DB_PASSWORD 和 DASHSCOPE_API_KEY"
echo "按 Enter 继续..."
read

# 启动
docker-compose up -d

# 验证
echo "✅ 部署完成！"
docker-compose ps
```

---

## 📝 前置条件检查

部署前确保服务器已有：

```bash
# 检查 Docker
docker --version

# 检查 Docker Compose
docker-compose --version

# 检查 Git
git --version

# 如果缺少，安装：
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# CentOS/RHEL
sudo yum install -y docker docker-compose git

# macOS
brew install docker docker-compose git
```

---

## 🔐 安全部署建议

### 1. 使用强密码

```bash
# 编辑 .env 时使用强密码
DB_PASSWORD=Str0ng!P@ssw0rd#2024
DASHSCOPE_API_KEY=your_secure_api_key
```

### 2. 配置防火墙

```bash
# 只开放必要的端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# 关闭数据库端口（不直接暴露）
# 5432 仅限内部容器访问
```

### 3. 使用 HTTPS

参考 `DOCKER_DEPLOYMENT_GUIDE.md` 中的"SSL/TLS 配置"部分。

---

## 📊 部署后验证

```bash
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 测试 API 连接
curl http://localhost:3000/api/health

# 访问前端
open http://localhost  # macOS
xdg-open http://localhost  # Linux
start http://localhost  # Windows

# 查看资源使用
docker stats
```

---

## 💾 备份和恢复

### 备份数据库

```bash
# 进入项目目录
cd /opt/ancient-arch

# 备份 PostgreSQL 数据
docker-compose exec postgres pg_dump -U postgres ancient_architecture > backup_$(date +%Y%m%d_%H%M%S).sql

# 或使用 make 命令
make db-backup
```

### 恢复数据库

```bash
# 从备份恢复
docker-compose exec -T postgres psql -U postgres ancient_architecture < backup_20260331_120000.sql
```

---

## 🔄 更新和回滚

### 更新到最新版本

```bash
cd /opt/ancient-arch

# 拉取最新代码
git pull origin main

# 重新构建
docker-compose build --no-cache

# 重启服务
docker-compose up -d

# 验证
docker-compose logs -f
```

### 回滚到上一个版本

```bash
cd /opt/ancient-arch

# 查看 Git 历史
git log --oneline -5

# 回滚到指定 commit
git checkout <commit-hash>

# 重新部署
docker-compose build
docker-compose up -d
```

---

## 📞 故障排查

### 问题：Git 克隆出现权限错误

```bash
# 使用 HTTPS 而不是 SSH
git clone https://github.com/your-username/ancient-chinese-architecture.git

# 或配置 SSH Key（推荐）
ssh-keygen -t ed25519
# 将公钥添加到 GitHub Settings
```

### 问题：Docker 权限不足

```bash
# 将用户添加到 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 或使用 sudo
sudo docker-compose up -d
```

### 问题：前端 dist 不存在

```bash
# 前端必须在本地构建
# 在本地机器用 HBuilderX:
# 1. 打开项目
# 2. 发行 → Web(H5)
# 3. 等待完成
# 4. 重新上传整个项目到服务器
```

### 问题：端口被占用

```bash
# 检查端口占用
lsof -i :80
lsof -i :3000
lsof -i :5432

# 更改 .env 中的端口
WEB_PORT=8080
BACKEND_PORT=3001

# 重启
docker-compose restart
```

---

## 🎯 完整流程总结

```
┌─────────────────────────────────────┐
│  1. 在本地构建前端                  │
│     HBuilderX: 发行 → Web(H5)       │
└──────────────┬──────────────────────┘
               │ 上传或 Git Push
               ▼
┌─────────────────────────────────────┐
│  2. 服务器克隆项目                  │
│     git clone <url>                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. 运行一键部署                    │
│     bash deploy.sh                  │
├─────────────────────────────────────┤
│  自动完成：                         │
│  ✓ 检查环境                         │
│  ✓ 创建 .env                        │
│  ✓ 构建镜像                         │
│  ✓ 启动容器                         │
│  ✓ 运行测试                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. 访问应用                        │
│     http://your-server              │
│     http://your-server:3000/api     │
└─────────────────────────────────────┘
```

---

## ✅ 部署检查清单

- [ ] 本地已用 HBuilderX 构建前端（frontend/dist 存在）
- [ ] 项目已推送到 GitHub（或私有 Git 服务器）
- [ ] 服务器已安装 Docker 和 Docker Compose
- [ ] 服务器已安装 Git
- [ ] 防火墙已开放 80、443 端口
- [ ] 已克隆项目到服务器
- [ ] 已复制 .env.example 为 .env
- [ ] 已编辑 .env，修改密码和 API Key
- [ ] 已运行 docker-compose up -d
- [ ] 已验证 http://your-server 能访问

---

## 🚀 现在就开始吧！

只需四行命令：

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch

# 2. 进入项目目录
cd /opt/ancient-arch

# 3. 一键部署
bash deploy.sh

# 4. 访问应用
# 打开浏览器访问 http://your-server
```

**完成！🎉**
