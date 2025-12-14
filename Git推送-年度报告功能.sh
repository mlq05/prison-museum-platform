#!/bin/bash

echo "========================================"
echo "推送年度报告功能到 GitHub"
echo "========================================"
echo ""

echo "本次更新内容："
echo "1. 修复统计界面数据同步问题"
echo "2. 添加领导来访标识功能（预约表单开关）"
echo "3. 新增年度报告功能（高频词、来访人数、领导来访统计）"
echo "4. 创建年度报告页面和API接口"
echo ""

echo "正在检查 Git 状态..."
git status
echo ""

echo "正在添加修改的文件..."
git add 服务器/routes/admin.js
git add 服务器/routes/booking.js
git add miniprogram/pages/booking-form/
git add miniprogram/pages/admin/
git add miniprogram/pages/admin-annual-report/
git add miniprogram/utils/api.ts
git add miniprogram/utils/types.ts
git add miniprogram/utils/constants.ts
git add miniprogram/app.json
echo ""

echo "正在提交更改..."
git commit -m "feat: 添加年度报告功能和领导来访标识

- 修复统计界面角色分布数据同步问题
- 在预约表单中添加领导来访开关按钮
- 新增年度报告功能（高频词统计、来访人数、领导来访统计）
- 创建年度报告页面和API接口
- 更新类型定义和API封装"
echo ""

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 提交成功！"
    echo ""
else
    echo ""
    echo "⚠️  提交失败，可能没有需要提交的更改"
    echo "继续尝试推送..."
    echo ""
fi

echo "正在推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ 代码推送成功！"
    echo "========================================"
    echo ""
    echo "接下来请："
    echo "1. 登录腾讯云 CloudBase 控制台"
    echo "2. 进入云托管服务 museum-api"
    echo "3. 点击'更新服务'或'部署新版本'"
    echo "4. 选择从 Git 仓库部署（如果已连接）"
    echo "   或手动上传服务器目录代码"
    echo ""
else
    echo ""
    echo "========================================"
    echo "❌ 推送失败"
    echo "========================================"
    echo ""
    echo "可能的原因："
    echo "1. 需要身份验证（使用 GitHub Personal Access Token）"
    echo "2. 有敏感信息被阻止（需要到 GitHub 允许推送）"
    echo "3. 网络问题"
    echo ""
fi

