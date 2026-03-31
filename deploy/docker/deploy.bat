@echo off
REM 古建筑AI导览 - 一键部署脚本（服务器用 Windows）
REM 使用方法: deploy.bat

setlocal enabledelayedexpansion

color 0B
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║       古建筑AI导览 - 一键部署脚本                              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM 检查 Docker
echo [1/5] 检查 Docker 环境...
docker --version >nul 2>&1
if errorlevel 1 (
    color 04
    echo ❌ 错误：未安装 Docker
    echo 请访问 https://www.docker.com/products/docker-desktop 安装 Docker
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    color 04
    echo ❌ 错误：未安装 Docker Compose
    pause
    exit /b 1
)

color 0A
echo ✅ Docker 已就位
color 0B

REM 检查并创建 .env
echo [2/5] 检查环境配置...
if not exist .env (
    echo    创建 .env 文件...
    copy .env.example .env >nul
    color 0A
    echo ✅ .env 已创建
    color 0E
    echo ⚠️  请编辑 .env 文件，至少修改以下项:
    echo    - DB_PASSWORD: 修改数据库密码
    echo    - DASHSCOPE_API_KEY: 设置你的 API Key（可选）
    echo.
    color 0B
    set /p confirm="已编辑完成？(Y/N) "
    if /i not "!confirm!"=="Y" (
        echo 请编辑 .env 后重新运行此脚本
        pause
        exit /b 1
    )
) else (
    color 0A
    echo ✅ .env 已存在
    color 0B
)

REM 检查前端
echo [3/5] 检查前端文件...
if not exist frontend\dist (
    color 0E
    echo ⚠️  未找到前端构建文件 (frontend\dist)
    echo.
    echo 需要先构建前端：
    echo   1. 在本地用 HBuilderX 打开此项目
    echo   2. 菜单: 发行 ^→ Web(H5)
    echo   3. 等待构建完成，会生成 frontend\dist 文件夹
    echo   4. 重新上传整个项目到服务器
    echo.
    color 0B
    set /p confirm="已完成前端构建？(Y/N) "
    if /i not "!confirm!"=="Y" (
        pause
        exit /b 1
    )
)
color 0A
echo ✅ 前端文件就位
color 0B

REM 构建镜像
echo [4/5] 构建镜像...
docker-compose build --quiet 2>nul
if errorlevel 1 (
    docker-compose build
)
color 0A
echo ✅ 镜像构建完成
color 0B

REM 启动服务
echo [5/5] 启动服务...
docker-compose up -d
timeout /t 5 /nobreak

REM 显示结果
cls
color 0B
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    部署完成！🎉                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

color 0A
echo 📍 访问地址:
echo    前端应用: http://localhost
echo    后端 API: http://localhost:3000
echo    API 文档: http://localhost:3000/api
echo.

echo 📊 服务状态:
docker-compose ps
echo.

color 0B
echo 💡 常用命令:
echo    查看日志:     docker-compose logs -f
echo    停止服务:     docker-compose stop
echo    重启服务:     docker-compose restart
echo    完全清理:     docker-compose down -v
echo.

color 0A
echo ✨ 一切就绪，开始使用吧！
color 0B
pause
