#!/bin/bash
# 古建筑AI导览 - Docker 快速启动脚本 (Linux/Mac)

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       古建筑AI导览 - Docker 环境快速启动                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 检查 Docker 是否已安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：未找到 Docker，请先安装 Docker"
    echo "   下载地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误：未找到 Docker Compose"
    exit 1
fi

echo "✅ Docker 已安装"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  未找到 .env 文件，从模板创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑并配置必要的参数"
    echo "   推荐编辑: DB_PASSWORD 和 DASHSCOPE_API_KEY"
    echo ""
fi

# 检查前端 dist 文件夹
if [ ! -d "frontend/dist" ]; then
    echo ""
    echo "⚠️  警告：未找到前端构建文件 (frontend/dist)"
    echo ""
    echo "需要先构建前端："
    echo "  方案 1: 使用 HBuilderX"
    echo "    - 打开 HBuilderX"
    echo "    - 打开此项目"
    echo "    - 菜单: 发行 → Web(H5)"
    echo ""
    echo "  方案 2: 命令行构建（需要支持）"
    echo "    cd frontend"
    echo "    npm install"
    echo "    npm run build"
    echo ""
    read -p "是否继续部署（Y/N）? " build_frontend
    if [ "$build_frontend" != "Y" ] && [ "$build_frontend" != "y" ]; then
        exit 0
    fi
fi

# 菜单选择
clear
echo ""
echo "请选择操作:"
echo "  1 - 启动所有服务 (up -d)"
echo "  2 - 启动服务（前台运行，便于查看日志）"
echo "  3 - 重启服务"
echo "  4 - 停止服务"
echo "  5 - 查看日志"
echo "  6 - 查看容器状态"
echo "  7 - 进行完整的清理和重新构建"
echo "  8 - 退出"
echo ""

read -p "请选择 (1-8): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动所有服务（后台运行）..."
        docker-compose up -d
        echo ""
        echo "✅ 启动完成！"
        echo ""
        echo "📍 访问地址:"
        echo "   - 前端应用: http://localhost"
        echo "   - 后端 API: http://localhost:3000"
        echo "   - API 健康检查: http://localhost:3000/api/health"
        echo ""
        echo "💡 使用 'docker-compose logs -f' 查看实时日志"
        echo ""
        ;;
    2)
        echo ""
        echo "🚀 启动所有服务（前台运行，按 Ctrl+C 停止）..."
        docker-compose up
        ;;
    3)
        echo ""
        echo "🔄 重启所有服务..."
        docker-compose restart
        echo ""
        echo "✅ 重启完成！"
        echo ""
        ;;
    4)
        echo ""
        echo "🛑 停止所有服务..."
        docker-compose stop
        echo ""
        echo "✅ 停止完成！"
        echo ""
        ;;
    5)
        echo ""
        echo "📋 查看实时日志（按 Ctrl+C 退出）..."
        docker-compose logs -f
        ;;
    6)
        echo ""
        echo "📊 容器状态:"
        docker-compose ps
        echo ""
        ;;
    7)
        echo ""
        echo "⚠️  即将清理并删除所有容器、镜像和数据（谨慎操作！）"
        read -p "确认操作吗？(yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  清理中..."
            docker-compose down -v
            docker-compose build --no-cache
            docker-compose up -d
            echo ""
            echo "✅ 清理和重建完成！"
            echo ""
        else
            echo "已取消"
        fi
        ;;
    8)
        echo "再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效的选择"
        ;;
esac
