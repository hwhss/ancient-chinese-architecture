# 🚀 古建筑AI导览 - 服务器部署快速参考

## ⚡ 最快的部署方式（4 行命令）

### Linux/Mac 用户：

```bash
# 一行完成所有操作
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch && \
cd /opt/ancient-arch && \
bash deploy.sh
```

或分步执行：

```bash
# Step 1: 克隆项目到 /opt/ancient-arch
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch

# Step 2: 进入项目目录
cd /opt/ancient-arch

# Step 3: 一键自动部署（处理所有配置）
bash deploy.sh

# Step 4: 完成！访问应用
# http://your-server
# http://your-server:3000/api/health
```

### Windows 用户（PowerShell）：

```powershell
# 克隆项目
git clone https://github.com/your-username/ancient-chinese-architecture.git C:\projects\ancient-arch
cd C:\projects\ancient-arch

# 运行一键部署脚本
.\deploy.bat
```

---

## 📋 详细步骤说明

### 第 0 步：前置准备（必做）

**在本地机器上构建前端：**

```
1. 用 HBuilderX 打开项目
2. 菜单: 发行 → Web(H5)
3. 等待构建完成（会生成 frontend/dist 文件夹）
4. 这是前端在服务器上运行的必要条件！
```

### 第 1 步：克隆项目到服务器

```bash
# 选择一个克隆方式：

# 方式 A: 使用 HTTPS（推荐，无需配置 SSH）
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch

# 方式 B: 使用 SSH（需提前配置 SSH Key）
git clone git@github.com:your-username/ancient-chinese-architecture.git /opt/ancient-arch

# 进入项目目录
cd /opt/ancient-arch
```

### 第 2 步：一键启动就完成了！

```bash
# Linux/Mac
bash deploy.sh

# Windows
deploy.bat
```

**`deploy.sh` 自动会：**

- ✅ 检查 Docker 是否已安装
- ✅ 创建 `.env` 文件（如果不存在）
- ✅ 提示你编辑关键配置（密码、API Key）
- ✅ 验证前端 dist 文件
- ✅ 构建 Docker 镜像
- ✅ 启动所有容器
- ✅ 运行健康检查

---

## 🔑 关键的环境变量配置

启动脚本会创建 `.env` 文件，**最少要改这 2 个：**

```env
# 1️⃣ 数据库密码（设成强密码）
DB_PASSWORD=Str0ng!P@ssw0rd#2024

# 2️⃣ API Key（从阿里云获取，可后续配置）
DASHSCOPE_API_KEY=sk-your_api_key_here
```

其他配置参考 `.env.example` 中的说明。

---

## 📍 部署完成后的访问地址

```
前端应用:     http://your-server-ip
后端 API:     http://your-server-ip:3000
API 健康检查: http://your-server-ip:3000/api/health
```

---

## 🎯 三种部署场景的命令

### 场景 1：全新服务器（从零开始）

```bash
# 假设你有一个 Ubuntu 20.04 服务器

# 1. 连接到服务器
ssh user@your-server-ip

# 2. 安装 Docker（如果没有）
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# 3. 将用户加入 docker 组（避免每次都用 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 4. 克隆并部署
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch
cd /opt/ancient-arch
bash deploy.sh

# 完成！现在访问 http://your-server-ip
```

### 场景 2：已有 Docker，直接部署

```bash
# 进入服务器
ssh user@your-server

# 直接克隆和启动
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch
cd /opt/ancient-arch
bash deploy.sh
```

### 场景 3：更新已部署的项目

```bash
# 进入项目目录
cd /opt/ancient-arch

# 拉取最新代码
git pull origin main

# 重新构建和启动
docker-compose build
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 🛠️ 常用操作命令

进入项目目录后（`cd /opt/ancient-arch`），可以使用：

```bash
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f backend       # 后端日志
docker-compose logs -f postgres      # 数据库日志
docker-compose logs -f nginx         # Web 服务器日志

# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 停止所有服务
docker-compose stop

# 启动所有服务
docker-compose start

# 完全清理（删除所有容器和数据）
docker-compose down -v

# 查看资源使用
docker stats
```

---

## 📊 一键启动与手动启动对比

| 操作     | 一键启动         | 手动启动      |
| -------- | ---------------- | ------------- |
| 流程     | `bash deploy.sh` | 5+ 步手动命令 |
| 时间     | 3-5 分钟         | 10+ 分钟      |
| 错误处理 | 自动             | 手动调试      |
| 适合     | **大多数用户**   | 需要细对控制  |

---

## ⚠️ 常见问题快速解决

| 问题             | 解决方案                                                     |
| ---------------- | ------------------------------------------------------------ |
| Git 克隆失败     | `git config --global http.sslVerify false` 或用 SSH          |
| Docker 权限不足  | `sudo usermod -aG docker $USER`                              |
| 前端 dist 不存在 | 本地用 HBuilderX 构建后重新上传                              |
| 端口被占用       | `netstat -ano \| findstr :80` 查看占用者，或改 .env 中的端口 |
| 数据库连接失败   | 检查 `.env` 中 DB_PASSWORD 是否正确                          |

---

## 🔐 生产环境注意事项

- [ ] 修改 DB_PASSWORD 为强密码
- [ ] 配置 DASHSCOPE_API_KEY
- [ ] 配置 CORS_ORIGIN 为实际域名
- [ ] 配置 SSL/TLS 证书（HTTPS）
- [ ] 限制 PostgreSQL 端口（仅内部访问）
- [ ] 设置定期备份策略
- [ ] 配置监控和日志收集

详见 `DOCKER_DEPLOYMENT_GUIDE.md` 的"生产部署"章节。

---

## 📱 不同平台的完整克隆命令

### GitHub HTTPS（推荐，无需 SSH 配置）

```bash
git clone https://github.com/your-username/ancient-chinese-architecture.git
```

### GitHub SSH（需要提前配置 SSH Key）

```bash
git clone git@github.com:your-username/ancient-chinese-architecture.git
```

### 克隆到指定目录

```bash
# 克隆到 /opt/ancient-arch
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch

# 克隆到当前目录的 deploy 文件夹
git clone https://github.com/your-username/ancient-chinese-architecture.git ./deploy
```

### 仅克隆最新一个 commit（快速）

```bash
git clone --depth 1 https://github.com/your-username/ancient-chinese-architecture.git
```

---

## ✅ 部署成功的标志

运行 `docker-compose ps` 看到：

```
CONTAINER ID  IMAGE                             STATUS              PORTS
xxxxx         ancient-arch-nginx:latest          Up 2 minutes       0.0.0.0:80->80/tcp
xxxxx         ancient-arch-backend:latest        Up 2 minutes       0.0.0.0:3000->3000/tcp
xxxxx         pgvector/pgvector:pg16-latest      Up 2 minutes       (no ports)
```

访问 `http://your-server` 看到前端应用已加载 ✅

测试 `curl http://your-server:3000/api/health` 返回 200 ✅

---

## 📚 文档速查

| 需求           | 查看文档                       |
| -------------- | ------------------------------ |
| 5分钟快速启动  | `QUICK_START.md`               |
| 完整部署指南   | `DOCKER_DEPLOYMENT_GUIDE.md`   |
| 前端部署详解   | `FRONTEND_DEPLOYMENT_GUIDE.md` |
| 服务器部署步骤 | `SERVER_DEPLOYMENT_GUIDE.md`   |
| 项目总览       | `README_DOCKER.md`             |

---

## 🎉 现在就开始吧！

### 一行命令完成所有操作：

```bash
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch && cd /opt/ancient-arch && bash deploy.sh
```

### 或三步更安全：

```bash
git clone https://github.com/your-username/ancient-chinese-architecture.git /opt/ancient-arch
cd /opt/ancient-arch
bash deploy.sh
```

**3-5 分钟后，访问 `http://your-server` 即可看到应用！** 🚀

---

## 📞 需要帮助？

1. **查看日志** - 90% 的问题都在日志中

   ```bash
   docker-compose logs -f
   ```

2. **检查文档** - 详细的指南和故障排查都在这里
   - `DOCKER_DEPLOYMENT_GUIDE.md` - 完整指南
   - `SERVER_DEPLOYMENT_GUIDE.md` - 服务器部署指南

3. **测试 API**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

**祝部署顺利！** 🎊
