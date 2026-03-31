#!/bin/bash
# 古建筑AI导览 - 一键部署脚本（服务器用）
# 使用方法: bash deploy.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       古建筑AI导览 - 一键部署脚本                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查 Docker
echo -e "${YELLOW}[1/5]${NC} 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误：未安装 Docker${NC}"
    echo "请访问 https://docs.docker.com/engine/install/ 安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ 错误：未安装 Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 已就位${NC}"

# 检查并创建 .env
echo -e "${YELLOW}[2/5]${NC} 检查环境配置..."
if [ ! -f ".env" ]; then
    echo "   创建 .env 文件..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env 已创建${NC}"
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，至少修改以下项:${NC}"
    echo "   - DB_PASSWORD: 修改数据库密码"
    echo "   - DASHSCOPE_API_KEY: 设置你的 API Key（可选，可稍后配置）"
    echo ""
    read -p "已编辑完成？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "请编辑 .env 后重新运行此脚本"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env 已存在${NC}"
fi

# 检查前端
echo -e "${YELLOW}[3/5]${NC} 检查前端文件..."
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}⚠️  未找到前端构建文件 (frontend/dist)${NC}"
    echo ""
    echo "需要先构建前端："
    echo "  1. 在本地用 HBuilderX 打开此项目"
    echo "  2. 菜单: 发行 → Web(H5)"
    echo "  3. 等待构建完成，会生成 frontend/dist 文件夹"
    echo "  4. 重新上传整个项目到服务器"
    echo ""
    read -p "已完成前端构建？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✅ 前端文件就位${NC}"

# 构建镜像
echo -e "${YELLOW}[4/5]${NC} 构建镜像..."
docker-compose build --quiet 2>/dev/null || docker-compose build

echo -e "${GREEN}✅ 镜像构建完成${NC}"

# 启动服务
echo -e "${YELLOW}[5/5]${NC} 启动服务..."
docker-compose up -d

# 等待服务就绪
echo -e "${YELLOW}等待服务启动...${NC}"
sleep 5

# 检查服务状态
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    部署完成！🎉                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📍 访问地址:${NC}"
echo "   前端应用: http://localhost"
echo "   后端 API: http://localhost:3000"
echo "   API 文档: http://localhost:3000/api"
echo ""

echo -e "${GREEN}📊 服务状态:${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}💡 常用命令:${NC}"
echo "   查看日志:     docker-compose logs -f"
echo "   停止服务:     docker-compose stop"
echo "   重启服务:     docker-compose restart"
echo "   完全清理:     docker-compose down -v"
echo ""

# 测试 API
echo -e "${BLUE}🧪 测试 API...${NC}"
for i in {1..5}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API 服务正常${NC}"
        break
    else
        if [ $i -lt 5 ]; then
            echo "   等待服务启动... (${i}/5)"
            sleep 2
        else
            echo -e "${YELLOW}⚠️  API 服务启动中，请稍后访问${NC}"
        fi
    fi
done

echo ""
echo -e "${GREEN}✨ 一切就绪，开始使用吧！${NC}"
