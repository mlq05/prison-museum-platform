#!/bin/bash

# 云开发云托管部署脚本
# 使用方法: ./deploy.sh

echo "=========================================="
echo "开始部署到云开发云托管..."
echo "=========================================="

# 检查是否安装了 CloudBase CLI
if ! command -v cloudbase &> /dev/null; then
    echo "❌ 未安装 CloudBase CLI"
    echo "请先安装: npm install -g @cloudbase/cli"
    exit 1
fi

# 检查是否已登录
echo "检查登录状态..."
cloudbase login --check

if [ $? -ne 0 ]; then
    echo "请先登录: cloudbase login"
    exit 1
fi

# 部署到云托管
echo "开始部署..."
cloudbase run:deploy --envId test-7g8oe7lq75832d7c

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "✅ 部署成功！"
    echo "=========================================="
    echo "请在云开发控制台查看服务地址"
else
    echo "=========================================="
    echo "❌ 部署失败"
    echo "=========================================="
    exit 1
fi

