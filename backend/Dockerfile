# 构建基础镜像
FROM node:20-alpine as base

WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 生产镜像
FROM base as production

# 复制 package 文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 确保 logs 和数据目录存在
RUN mkdir -p logs data data-jsondb

# 暴露端口
EXPOSE 3000

# 环境变量默认值
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "app.js"]

# 标签
LABEL maintainer="ancient-architecture"
LABEL version="1.0.0"
