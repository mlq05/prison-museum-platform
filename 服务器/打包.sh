#!/bin/bash

# 服务器代码打包脚本 (Linux/Mac)
# 用于云托管部署

echo "=========================================="
echo "开始打包服务器代码..."
echo "=========================================="

# 检查当前目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在 服务器 目录下运行此脚本"
    exit 1
fi

# 创建临时打包目录
PACKAGE_DIR="server-package"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo ""
echo "正在复制文件..."

# 复制必需文件
cp server.js "$PACKAGE_DIR/"
cp package.json "$PACKAGE_DIR/"
[ -f "package-lock.json" ] && cp package-lock.json "$PACKAGE_DIR/"
cp Dockerfile "$PACKAGE_DIR/"
[ -f ".dockerignore" ] && cp .dockerignore "$PACKAGE_DIR/"
[ -f "cloudbaserc.json" ] && cp cloudbaserc.json "$PACKAGE_DIR/"

# 复制目录
echo "复制 db 目录..."
cp -r db "$PACKAGE_DIR/"

echo "复制 routes 目录..."
cp -r routes "$PACKAGE_DIR/"

echo "复制 middleware 目录..."
cp -r middleware "$PACKAGE_DIR/"

echo "复制 scripts 目录..."
cp -r scripts "$PACKAGE_DIR/"

# 删除旧的压缩包
[ -f "server.zip" ] && rm server.zip
[ -f "server.tar.gz" ] && rm server.tar.gz

echo ""
echo "正在压缩文件..."

# 创建压缩包
cd "$PACKAGE_DIR"
zip -r ../server.zip . > /dev/null
cd ..

# 或者创建 tar.gz（可选）
# tar -czf server.tar.gz -C "$PACKAGE_DIR" .

# 清理临时目录
rm -rf "$PACKAGE_DIR"

echo ""
echo "=========================================="
echo "✅ 打包完成！"
echo "=========================================="
echo ""
echo "打包文件：server.zip"
echo ""
echo "文件大小："
ls -lh server.zip | awk '{print $5}'
echo ""
echo "下一步："
echo "1. 在云开发控制台上传 server.zip"
echo "2. 配置环境变量"
echo "3. 点击部署"
echo ""

