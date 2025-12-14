#!/bin/bash

echo "========================================"
echo "配置 Git 用户信息"
echo "========================================"
echo ""

echo "请输入你的 GitHub 用户名："
read GITHUB_USERNAME

echo "请输入你的 GitHub 邮箱："
read GITHUB_EMAIL

echo ""
echo "正在配置 Git 用户信息..."
git config --global user.name "$GITHUB_USERNAME"
git config --global user.email "$GITHUB_EMAIL"

echo ""
echo "✅ Git 用户信息已配置！"
echo "  用户名: $GITHUB_USERNAME"
echo "  邮箱: $GITHUB_EMAIL"
echo ""
echo "现在可以继续执行推送命令了。"
echo ""

