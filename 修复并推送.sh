#!/bin/bash

echo "========================================"
echo "配置 Git 并推送代码"
echo "========================================"
echo ""

# 1. 配置用户信息（请修改为你的信息）
echo "步骤1: 配置 Git 用户信息..."
echo "请输入你的 GitHub 用户名（或直接回车使用 mlq05）："
read -r GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-mlq05}

echo "请输入你的 GitHub 邮箱："
read -r GITHUB_EMAIL

if [ -z "$GITHUB_EMAIL" ]; then
    echo "⚠️  邮箱不能为空，请重新运行脚本"
    exit 1
fi

git config --global user.name "$GITHUB_USERNAME"
git config --global user.email "$GITHUB_EMAIL"
echo "✅ 用户信息已配置：$GITHUB_USERNAME <$GITHUB_EMAIL>"
echo ""

# 2. 修复所有权
echo "步骤2: 修复仓库所有权..."
git config --global --add safe.directory D:/test4 2>/dev/null
echo "✅ 完成"
echo ""

# 3. 检查状态
echo "步骤3: 检查 Git 状态..."
cd /d/test4
git status
echo ""

# 4. 添加文件
echo "步骤4: 添加修改的文件..."
git add 服务器/routes/admin.js 2>/dev/null
git add 服务器/routes/booking.js 2>/dev/null
git add miniprogram/pages/booking-form/ 2>/dev/null
git add miniprogram/pages/admin/ 2>/dev/null
git add miniprogram/pages/admin-annual-report/ 2>/dev/null
git add miniprogram/utils/api.ts 2>/dev/null
git add miniprogram/utils/types.ts 2>/dev/null
git add miniprogram/utils/constants.ts 2>/dev/null
git add miniprogram/app.json 2>/dev/null

# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "⚠️  没有检测到需要提交的更改"
    echo "检查工作区是否有未暂存的更改..."
    if git diff --quiet && git diff --cached --quiet; then
        echo "✅ 工作区干净，所有更改已提交"
        echo ""
        echo "尝试推送..."
        git push origin main
    else
        echo "发现未暂存的更改，正在添加..."
        git add -A
        echo ""
    fi
else
    echo "✅ 文件已添加到暂存区"
    echo ""
fi

# 5. 提交（如果有更改）
echo "步骤5: 检查是否需要提交..."
if ! git diff --cached --quiet; then
    echo "正在提交..."
    git commit -m "feat: 添加年度报告功能和领导来访标识

- 修复统计界面角色分布数据同步问题
- 在预约表单中添加领导来访开关按钮
- 新增年度报告功能（高频词统计、来访人数、领导来访统计）
- 创建年度报告页面和API接口
- 更新类型定义和API封装"
    
    if [ $? -eq 0 ]; then
        echo "✅ 提交成功！"
        echo ""
    fi
elif [ "$(git log -1 --pretty=%B)" != "feat: 添加年度报告功能和领导来访标识" ]; then
    echo "⚠️  更改可能已提交，但提交信息不同"
    echo "检查最近的提交..."
    git log -1 --oneline
    echo ""
fi

# 6. 推送
echo "步骤6: 推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ 代码推送成功！"
    echo "========================================"
    echo ""
else
    echo ""
    echo "========================================"
    echo "⚠️  推送可能已完成或遇到问题"
    echo "========================================"
    echo ""
    echo "检查远程状态..."
    git status
    echo ""
fi

