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

# 检查是否已登录（跳过检查，直接尝试部署，如果未登录会提示）
echo "检查登录状态..."
# 注意：如果未登录，部署时会自动提示登录

# 部署到云托管
echo "开始部署..."
echo "环境ID: cloud1-6glt083780b46f82"
echo "服务名: museum-api"
echo ""
cloudbase run deploy -e cloud1-6glt083780b46f82 -s museum-api --containerPort 80

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

