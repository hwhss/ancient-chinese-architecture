.PHONY: help up down logs restart status clean build rebuild db-seed db-migrate test-api

help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║       古建筑AI导览 - Docker 操作命令                            ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "基础命令:"
	@echo "  make up              - 启动所有服务"
	@echo "  make down            - 停止所有服务"
	@echo "  make restart         - 重启所有服务"
	@echo "  make logs            - 查看实时日志"
	@echo "  make status          - 查看容器状态"
	@echo ""
	@echo "开发命令:"
	@echo "  make build           - 构建后端镜像"
	@echo "  make rebuild         - 清理并重新构建所有镜像"
	@echo "  make clean           - 完全清理（删除所有容器和卷）"
	@echo ""
	@echo "数据库命令:"
	@echo "  make db-migrate      - 运行数据库迁移"
	@echo "  make db-seed         - 填充示例数据"
	@echo "  make db-backup       - 备份数据库"
	@echo "  make db-restore      - 恢复数据库（需要指定备份文件）"
	@echo ""
	@echo "测试命令:"
	@echo "  make test-api        - 测试 API 健康检查"
	@echo "  make test-embedding  - 测试向量嵌入"
	@echo "  make test-chat       - 运行聊天测试"
	@echo ""
	@echo "例："
	@echo "  make up              # 启动所有服务"
	@echo "  make logs            # 查看日志"
	@echo "  make test-api        # 测试 API"
	@echo ""

# 环境检查
check-docker:
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose 未安装"; exit 1; }
	@echo "✅ Docker 已安装"

check-env:
	@[ -f .env ] || { echo "⚠️  .env 文件不存在，正在从模板创建"; cp .env.example .env; echo "✅ 已创建 .env，请编辑配置"; }

check-frontend:
	@[ -d "frontend/dist" ] || { echo "⚠️  前端 dist 文件夹不存在，请先用 HBuilderX 构建"; echo "   发行 → Web(H5)"; exit 1; }
	@echo "✅ 前端文件已就位"

# 基础命令
up: check-docker check-env check-frontend
	@echo "🚀 启动所有服务..."
	@docker-compose up -d
	@echo "✅ 启动完成"
	@echo ""
	@echo "📍 访问地址:"
	@echo "   - 前端: http://localhost"
	@echo "   - API: http://localhost:3000"
	@echo "   - 健康检查: http://localhost:3000/api/health"
	@echo ""

up-foreground: check-docker check-env check-frontend
	@echo "🚀 启动所有服务（前台，按 Ctrl+C 停止）..."
	@docker-compose up

down: check-docker
	@echo "🛑 停止所有服务..."
	@docker-compose down
	@echo "✅ 已停止"

logs: check-docker
	@docker-compose logs -f

logs-backend: check-docker
	@docker-compose logs -f backend

logs-db: check-docker
	@docker-compose logs -f postgres

logs-nginx: check-docker
	@docker-compose logs -f nginx

restart: check-docker
	@echo "🔄 重启所有服务..."
	@docker-compose restart
	@echo "✅ 重启完成"

status: check-docker
	@echo "📊 容器状态:"
	@docker-compose ps
	@echo ""
	@echo "📊 资源使用:"
	@docker stats --no-stream

# 构建和清理
build: check-docker
	@echo "🔨 构建后端镜像..."
	@docker-compose build backend
	@echo "✅ 构建完成"

rebuild: check-docker
	@echo "🗑️  清理现有镜像..."
	@docker-compose down -v
	@echo "🔨 重新构建..."
	@docker-compose build --no-cache
	@echo "✅ 重新构建完成"

clean: check-docker
	@echo "⚠️  即将删除所有容器、镜像和数据"
	@read -p "确认吗？ (yes/no): " confirm && \
		if [ "$$confirm" = "yes" ]; then \
			docker-compose down -v; \
			docker system prune -af; \
			echo "✅ 清理完成"; \
		fi

# 数据库操作
db-migrate: check-docker
	@echo "📊 运行数据库迁移..."
	@docker-compose exec backend npm run db:migrate
	@echo "✅ 迁移完成"

db-seed: check-docker
	@echo "🌱 填充示例数据..."
	@docker-compose exec backend npm run db:seed
	@echo "✅ 数据填充完成"

db-setup: db-migrate db-seed
	@echo "✅ 数据库设置完成"

db-backup: check-docker
	@echo "💾 备份数据库..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U postgres -d ancient_architecture > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ 备份完成"

db-restore:
	@[ -z "$(FILE)" ] && { echo "使用: make db-restore FILE=path/to/backup.sql"; exit 1; }
	@echo "📥 恢复数据库..."
	@docker-compose exec -T postgres psql -U postgres ancient_architecture < $(FILE)
	@echo "✅ 恢复完成"

# 测试命令
test-api: check-docker
	@echo "🧪 测试 API 健康检查..."
	@curl -s http://localhost:3000/api/health | jq . || echo "❌ API 不可用"

test-embedding: check-docker
	@echo "🧪 测试向量嵌入..."
	@docker-compose exec backend npm run test:embedding

test-chat: check-docker
	@echo "🧪 运行聊天测试..."
	@docker-compose exec backend npm run test:chat-retrieval

test-all: test-api test-embedding test-chat

# 前端操作
frontend-build:
	@echo "📦 构建前端..."
	@cd frontend && npm run build

frontend-check: check-frontend
	@echo "✅ 前端文件就位"

# 监控
monitor:
	@watch -n 1 'docker-compose ps && echo ""; docker stats --no-stream'

shell-backend: check-docker
	@docker-compose exec backend sh

shell-db: check-docker
	@docker-compose exec postgres psql -U postgres

# 配置管理
config-validate: check-docker
	@echo "🔍 验证配置..."
	@docker-compose config --validate
	@echo "✅ 配置正确"

config-show: check-docker
	@docker-compose config

env-create:
	@[ -f .env ] && echo ".env 已存在" || { cp .env.example .env; echo "✅ 已创建 .env"; }

env-edit:
	$(EDITOR) .env

# 一键操作
init: check-docker env-create check-frontend up
	@echo ""
	@echo "🎉 初始化完成！"
	@echo "📍 访问 http://localhost 开始使用"

production-deploy: check-docker rebuild up
	@echo "🚀 生产环境部署完成"

development: env-create build up-foreground

# 信息命令
version:
	@echo "版本信息:"
	@docker-compose version
	@echo ""
	@docker version

info:
	@echo "系统信息:"
	@uname -a
	@echo ""
	@echo "Docker 信息:"
	@docker info | head -20

# 清理日志
clean-logs: check-docker
	@docker-compose exec backend rm -rf logs/*
	@echo "✅ 已清理后端日志"

# 快捷命令
ps: status
dev: development
prod: production-deploy
test: test-all
