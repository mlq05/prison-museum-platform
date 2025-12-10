# 微信云托管部署 - 根目录 Dockerfile
# 用于从 服务器/ 子目录构建

# 使用 Node.js 16（匹配云托管配置 nodejs16）
FROM node:16

WORKDIR /app

# 复制服务器目录的 package 文件
COPY 服务器/package*.json ./

# 安装依赖
RUN npm install --production

# 复制服务器目录的所有文件
COPY 服务器/ ./

# 创建必要的目录
RUN mkdir -p /tmp/data /tmp/uploads/images /tmp/uploads/audio

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "server.js"]

