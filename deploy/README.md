# 部署目录

本目录包含所有与部署相关的文件和文档。

## 目录结构

```
deploy/
├── docker/              # Docker 部署文件
│   ├── docker-compose.yml    # Docker Compose 配置
│   ├── Dockerfile              # 后端服务镜像构建
│   ├── nginx.conf               # Nginx 主配置
│   ├── nginx-default.conf       # Nginx 默认站点配置
│   ├── deploy.bat               # Windows 部署脚本
│   ├── deploy.sh                # Linux/Mac 部署脚本
│   ├── docker-start.ps1         # PowerShell 启动脚本
│   ├── docker-start.sh          # Linux 启动脚本
│   ├── start-docker.bat         # Windows 快速启动
│   └── start-docker.sh          # Linux 快速启动
├── docs/                # 部署文档
│   ├── DOCKER_DEPLOYMENT_GUIDE.md    # Docker 部署指南
│   ├── SERVER_DEPLOYMENT_GUIDE.md    # 服务器部署指南
│   ├── FRONTEND_DEPLOYMENT_GUIDE.md  # 前端部署指南
│   ├── DEPLOYMENT_OVERVIEW.md        # 部署概览
│   ├── FINAL_DEPLOYMENT_SUMMARY.md   # 最终部署总结
│   ├── SERVER_QUICK_START.md         # 服务器快速开始
│   ├── README_DOCKER.md              # Docker 说明
│   ├── QUICK_START.md                # 快速开始
│   ├── deploy.bat                    # Windows 部署脚本
│   └── deploy.sh                     # Linux 部署脚本
└── README.md            # 本文件
```

## 快速开始

### 1. Docker 部署（推荐）

```bash
# 进入 docker 目录
cd deploy/docker

# 复制环境变量文件
cp .env.example .env
# 编辑 .env 文件，配置你的参数

# 启动服务
docker-compose up -d
```

### 2. 传统部署

参考 `deploy/docs/` 目录下的部署文档。

## 环境变量

在 `deploy/docker/.env` 文件中配置：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_NAME | 数据库名 | ancient_architecture |
| DB_USER | 数据库用户 | postgres |
| DB_PASSWORD | 数据库密码 | postgres123 |
| DB_PORT | 数据库端口 | 5432 |
| BACKEND_PORT | 后端服务端口 | 3000 |
| WEB_PORT | Web 服务端口 | 80 |
| DATA_SOURCE | 数据源 (json/postgres) | json |

## 注意事项

1. **生产环境部署前**：
   - 修改默认密码
   - 配置 SSL 证书
   - 配置防火墙规则

2. **数据备份**：
   - 定期备份 PostgreSQL 数据
   - 备份 `deploy/docker/.env` 文件

3. **更新部署**：
   - 先备份数据
   - 拉取最新代码
   - 重新构建镜像
   - 重启服务
