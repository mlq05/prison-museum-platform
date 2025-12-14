#!/bin/bash

echo "========================================"
echo "完整推送流程 - 年度报告功能"
echo "========================================"
echo ""

# 1. 修复所有权问题
echo "步骤1: 修复 Git 仓库所有权问题..."
git config --global --add safe.directory D:/test4
echo "✅ 完成"
echo ""

# 2. 检查状态
echo "步骤2: 检查 Git 状态..."
git status
echo ""

# 3. 添加文件
echo "步骤3: 添加修改的文件..."
git add 服务器/routes/admin.js
git add 服务器/routes/booking.js
git add miniprogram/pages/booking-form/
git add miniprogram/pages/admin/
git add miniprogram/pages/admin-annual-report/
git add miniprogram/utils/api.ts
git add miniprogram/utils/types.ts
git add miniprogram/utils/constants.ts
git add miniprogram/app.json
echo "✅ 完成"
echo ""

# 4. 提交
echo "步骤4: 提交更改..."
git commit -m "feat: 添加年度报告功能和领导来访标识

- 修复统计界面角色分布数据同步问题
- 在预约表单中添加领导来访开关按钮
- 新增年度报告功能（高频词统计、来访人数、领导来访统计）
- 创建年度报告页面和API接口
- 更新类型定义和API封装"
echo ""

if [ $? -eq 0 ]; then
    echo "✅ 提交成功！"
    echo ""
else
    echo "⚠️  提交可能失败或无更改需要提交，继续尝试推送..."
    echo ""
fi

# 5. 推送
echo "步骤5: 推送到 GitHub..."
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
    echo ""
else
    echo ""
    echo "========================================"
    echo "❌ 推送失败"
    echo "========================================"
    echo ""
    echo "请检查："
    echo "1. 网络连接"
    echo "2. GitHub 身份验证"
    echo "3. 是否有敏感信息被阻止"
    echo ""
fi

