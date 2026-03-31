# 🚀 Docker 部署快速参考卡

## 一句话总结

你的项目现在**完整容器化**，包括：

- 📦 PostgreSQL 数据库 + pgvector 向量扩展
- 🔧 Node.js 后端
- 🌐 前端应用（H5）
- 🔄 Nginx 反向代理

**只需一条命令启动所有服务！**

---

## ⚡ 超快开始（5 分钟）

### Windows

```bash
# 1. 用 HBuilderX 构建前端发行 → Web(H5)

# 2. 在项目根目录运行
start-docker.bat

# 3. 选择 "1 - 启动所有服务"

# 4. 等待 1 分钟，开始使用
# 访问: http://localhost
```

### Mac/Linux

```bash
# 1. 用 HBuilderX 构建前端发行 → Web(H5)

# 2. 在项目根目录运行
bash start-docker.sh

# 3. 选择 "1 - 启动所有服务"

# 4. 访问: http://localhost
```

---

## 🎯 3 个最常见命令

```bash
# 启动所有服务（后台）
docker-compose up -d

# 查看实时日志
docker-compose logs -f

# 停止所有服务
docker-compose down
```

---

## 📍 访问地址

| 服务     | 地址                             | 说明         |
| -------- | -------------------------------- | ------------ |
| 前端应用 | http://localhost                 | Web 应用     |
| 后端 API | http://localhost:3000            | REST API     |
| 健康检查 | http://localhost:3000/api/health | 检查后端状态 |
| 数据库   | localhost:5432                   | PostgreSQL   |

---

## 🔑 关键文件说明

| 文件                           | 用途                     |
| ------------------------------ | ------------------------ |
| `docker-compose.yml`           | 定义所有容器和网络       |
| `backend/Dockerfile`           | 后端镜像构建脚本         |
| `nginx.conf`                   | Nginx 配置               |
| `.env`                         | 环境变量（**需要创建**） |
| `DOCKER_DEPLOYMENT_GUIDE.md`   | 完整部署指南             |
| `FRONTEND_DEPLOYMENT_GUIDE.md` | 前端部署详解             |

---

## 🛠️ 故障排查

### ❌ 前端一片空白

**原因：** 前端 `dist` 文件夹不存在

**解决：**

```bash
# 用 HBuilderX: 发行 → Web(H5)
# 或命令行 (如果支持):
cd frontend
npm run build
```

### ❌ API 连接失败

**原因：** 后端服务未启动或配置错误

**解决：**

```bash
# 查看后端日志
docker-compose logs backend

# 检查后端是否运行
curl http://localhost:3000/api/health
```

### ❌ 数据库连接失败

**原因：** 数据库密码配置错误

**解决：**

```bash
# 编辑 .env
DB_PASSWORD=your_password

# 重启
docker-compose restart postgres
```

---

## 📦 前端部署说明

### 问题：为什么需要 HBuilderX？

**答：** 项目用 UNI-APP（跨平台框架），HBuilderX 是官方 IDE，能快速构建成 H5。

没有 HBuilderX 两个办法：

1. **推荐：** 在本地用 HBuilderX 构建，上传 `dist` 文件夹到服务器
2. **备选：** 使用 `npm run build` （需要项目配置支持）

### Linux/Mac 部署流程

```bash
# 1. 本地构建（Windows 用户用 HBuilderX）
cd frontend
npm install
npm run build  # 或 uni build -p h5

# 2. 上传到服务器
scp -r dist/* user@server:/path/to/project/frontend/dist/

# 3. 服务器启动
cd /path/to/project
docker-compose up -d

# 4. 完成
curl http://localhost
```

---

## 🚀 生产部署清单

- [ ] 已修改 `.env` 中的密码
- [ ] 已设置 `DASHSCOPE_API_KEY`
- [ ] 已配置 CORS_ORIGIN 为前端域名
- [ ] 已启用 HTTPS（配置 SSL 证书）
- [ ] 已限制 PostgreSQL 端口（仅内部）
- [ ] 已配置定期备份
- [ ] 已设置日志轮转
- [ ] 已测试核心功能

---

## 🐛 调试技巧

### 查看特定服务的日志

```bash
docker-compose logs backend           # 后端日志
docker-compose logs postgres          # 数据库日志
docker-compose logs nginx             # Nginx 日志
docker-compose logs -f --tail=50      # 最后 50 行，实时跟踪
```

### 进入容器执行命令

```bash
docker-compose exec backend sh        # 进入后端
docker-compose exec postgres psql -U postgres  # 进入数据库

# 在后端容器中运行测试
docker-compose exec backend npm run test:embedding
```

### 查看服务状态

```bash
docker-compose ps                     # 所有容器状态
docker-compose ps --services          # 所有服务名称
docker stats                          # 实时资源使用
```

---

## 🔄 常见操作

```bash
# 修改代码后重新构建
docker-compose build backend
docker-compose up -d backend

# 查看完整的 docker-compose 配置
docker-compose config

# 验证配置文件语法
docker-compose config --validate

# 清理未使用的资源
docker system prune -a

# 导出数据库
docker-compose exec postgres pg_dump -U postgres ancient_architecture > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres ancient_architecture < backup.sql
```

---

## 💡 性能优化建议

```bash
# 增加数据库连接池
# 编辑 .env:
DB_POOL_MAX=30

# 启用 Redis 缓存（可选）
# 添加 redis 到 docker-compose.yml

# 配置 CDN 加速静态资源
# 在 Nginx 中配置缓存头

# 启用 Gzip 压缩
# 已在 nginx.conf 中配置
```

---

## 🎓 后续学习

了解更多，查看详细文档：

- [完整部署指南](DOCKER_DEPLOYMENT_GUIDE.md) - 深度指南，包含所有配置细节
- [前端部署说明](FRONTEND_DEPLOYMENT_GUIDE.md) - 前端构建和部署详解
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

---

## ⚡ 核心要点（背下来）

| 需求 | 命令                                                                    |
| ---- | ----------------------------------------------------------------------- |
| 启动 | `docker-compose up -d`                                                  |
| 停止 | `docker-compose down`                                                   |
| 日志 | `docker-compose logs -f`                                                |
| 重启 | `docker-compose restart`                                                |
| 重建 | `docker-compose build --no-cache && docker-compose up -d`               |
| 备份 | `docker-compose exec postgres pg_dump -U postgres DB_NAME > backup.sql` |

---

## 📞 常见问题（FAQ）

**Q: 在哪里配置 API 地址？**
A: 编辑 `frontend/services/api.js`，设置 `API_BASE` 为后端地址。Docker 中已自动配置好。

**Q: 如何添加 SSL 证书？**
A: 查看 [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md) 中的"生产部署"章节。

**Q: 可以在没有 Internet 的环境运行吗？**
A: 可以，需要提前下载所有 Docker 镜像，然后离线使用。

**Q: 如何监控运行状态？**
A: `docker stats` 查看实时监控，或配置 Prometheus + Grafana。

**Q: 支持多个后端实例吗？**
A: 可以，配置 Docker Swarm 或 Kubernetes。

---

## 🎯 下一步行动

```
1. ✅ 用 HBuilderX 构建前端 (发行 → Web(H5))

2. ✅ 复制 .env: cp .env.example .env

3. ✅ 编辑 .env，设置: DB_PASSWORD 和 DASHSCOPE_API_KEY

4. ✅ 运行: docker-compose up -d

5. ✅ 访问: http://localhost

6. ✅ 完成！🎉
```

---

**最后提示：**

- 所有文件都有注释说明，不懂就看源代码～
- 遇到问题先看 docker logs
- Docker 官方文档是救星

祝部署顺利！🚀
