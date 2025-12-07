# 使用 Node.js 16（匹配云托管配置 nodejs16）
FROM node:16

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p /tmp/data /tmp/uploads/images /tmp/uploads/audio

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "server.js"]
