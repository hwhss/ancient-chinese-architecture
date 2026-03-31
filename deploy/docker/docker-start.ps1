# 古建筑AI导览 - Docker 快速启动脚本 (PowerShell)
# 用法: .\docker-start.ps1

param(
    [string]$Command = "menu"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       古建筑AI导览 - Docker 环境（PowerShell）                  ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Docker {
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        Write-Host "✅ Docker 已安装" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ 错误：未找到 Docker，请先安装 Docker Desktop" -ForegroundColor Red
        Write-Host "   下载地址: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

function Check-Env {
    if (-not (Test-Path ".env")) {
        Write-Host ""
        Write-Host "⚠️  未找到 .env 文件，从模板创建..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ 已创建 .env 文件，请编辑并配置必要的参数" -ForegroundColor Green
        Write-Host "   重要配置: DB_PASSWORD 和 DASHSCOPE_API_KEY"
        Write-Host ""
    }
}

function Check-Frontend {
    if (-not (Test-Path "frontend/dist")) {
        Write-Host ""
        Write-Host "⚠️  警告：未找到前端构建文件 (frontend\dist)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "需要先构建前端："
        Write-Host "  方案 1: 使用 HBuilderX"
        Write-Host "    - 打开 HBuilderX"
        Write-Host "    - 打开此项目"
        Write-Host "    - 菜单: 发行 → Web(H5)"
        Write-Host ""
        Write-Host "  方案 2: 命令行构建（需要支持）"
        Write-Host "    cd frontend"
        Write-Host "    npm install"
        Write-Host "    npm run build"
        Write-Host ""
        $continue = Read-Host "是否继续部署（Y/N）"
        if ($continue -ne "Y" -and $continue -ne "y") {
            exit 0
        }
        Write-Host ""
    }
}

function Show-Menu {
    Clear-Host
    Write-Header
    Write-Host "请选择操作:"
    Write-Host "  1️⃣  启动所有服务 (up -d)"
    Write-Host "  2️⃣  启动服务（前台运行，便于查看日志）"
    Write-Host "  3️⃣  重启服务"
    Write-Host "  4️⃣  停止服务"
    Write-Host "  5️⃣  查看日志"
    Write-Host "  6️⃣  查看容器状态"
    Write-Host "  7️⃣  运行数据库迁移"
    Write-Host "  8️⃣  查看后端服务日志"
    Write-Host "  9️⃣  进入后端容器"
    Write-Host "  0️⃣  进行完整的清理和重新构建"
    Write-Host "  Q - 退出"
    Write-Host ""
}

function Start-Services {
    Write-Host ""
    Write-Host "🚀 启动所有服务（后台运行）..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ 启动完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 访问地址:" -ForegroundColor Cyan
    Write-Host "   - 前端应用: http://localhost"
    Write-Host "   - 后端 API: http://localhost:3000"
    Write-Host "   - API 健康检查: http://localhost:3000/api/health"
    Write-Host ""
    Write-Host "💡 使用 'docker-compose logs -f' 查看实时日志" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function Start-Services-Foreground {
    Write-Host ""
    Write-Host "🚀 启动所有服务（前台运行，按 Ctrl+C 停止）..." -ForegroundColor Green
    docker-compose up
}

function Restart-Services {
    Write-Host ""
    Write-Host "🔄 重启所有服务..." -ForegroundColor Green
    docker-compose restart
    Write-Host ""
    Write-Host "✅ 重启完成！" -ForegroundColor Green
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function Stop-Services {
    Write-Host ""
    Write-Host "🛑 停止所有服务..." -ForegroundColor Yellow
    docker-compose stop
    Write-Host ""
    Write-Host "✅ 停止完成！" -ForegroundColor Green
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function View-Logs {
    Write-Host ""
    Write-Host "📋 查看实时日志（按 Ctrl+C 退出）..." -ForegroundColor Green
    docker-compose logs -f
}

function Show-Status {
    Write-Host ""
    Write-Host "📊 容器状态:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function DB-Migrate {
    Write-Host ""
    Write-Host "📊 运行数据库迁移..."  -ForegroundColor Green
    docker-compose exec backend npm run db:migrate
    Write-Host ""
    Write-Host "✅ 迁移完成！" -ForegroundColor Green
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function View-Backend-Logs {
    Write-Host ""
    Write-Host "📋 后端服务日志（按 Ctrl+C 退出）..." -ForegroundColor Green
    docker-compose logs -f backend
}

function Enter-Backend {
    Write-Host ""
    Write-Host "🔧 进入后端容器（输入 'exit' 退出）..." -ForegroundColor Green
    docker-compose exec backend sh
    Write-Host ""
    Read-Host "按 Enter 返回菜单"
}

function Clean-And-Rebuild {
    Write-Host ""
    Write-Host "⚠️  即将清理并删除所有容器、镜像和数据（谨慎操作！）" -ForegroundColor Red
    $confirm = Read-Host "确认操作吗？(yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "🗑️  清理中..." -ForegroundColor Yellow
        docker-compose down -v
        Write-Host "🔨 重新构建中..." -ForegroundColor Yellow
        docker-compose build --no-cache
        Write-Host "🚀 启动服务中..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host ""
        Write-Host "✅ 清理和重建完成！" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Host "已取消"
    }
    Read-Host "按 Enter 返回菜单"
}

# 主程序
Write-Header

if (-not (Check-Docker)) {
    exit 1
}

Check-Env
Check-Frontend

# 命令行参数处理
if ($Command -ne "menu") {
    switch ($Command) {
        "up" { Start-Services; exit 0 }
        "start" { Start-Services; exit 0 }
        "down" { Stop-Services; exit 0 }
        "stop" { Stop-Services; exit 0 }
        "restart" { Restart-Services; exit 0 }
        "logs" { View-Logs; exit 0 }
        "status" { Show-Status; exit 0 }
        "ps" { Show-Status; exit 0 }
        default {
            Write-Host "未知命令: $Command" -ForegroundColor Red
            Write-Host ""
            Write-Host "用法:"
            Write-Host "  .\docker-start.ps1                # 显示菜单"
            Write-Host "  .\docker-start.ps1 -Command up    # 直接启动"
            Write-Host "  .\docker-start.ps1 -Command down  # 停止"
            exit 1
        }
    }
}

# 交互式菜单循环
do {
    Show-Menu
    $choice = Read-Host "请选择 (1-9,0,Q)"

    switch ($choice) {
        "1" { Start-Services }
        "2" { Start-Services-Foreground }
        "3" { Restart-Services }
        "4" { Stop-Services }
        "5" { View-Logs }
        "6" { Show-Status }
        "7" { DB-Migrate }
        "8" { View-Backend-Logs }
        "9" { Enter-Backend }
        "0" { Clean-And-Rebuild }
        "Q" {
            Write-Host ""
            Write-Host "再见！" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "❌ 无效的选择" -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
