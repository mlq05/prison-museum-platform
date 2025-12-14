#!/bin/bash

echo "========================================"
echo "修复 Git 仓库所有权问题"
echo "========================================"
echo ""

echo "正在添加安全目录例外..."
git config --global --add safe.directory D:/test4

if [ $? -eq 0 ]; then
    echo "✅ 安全目录已添加！"
    echo ""
    echo "现在可以继续执行推送命令了："
    echo ""
    echo "cd /d/test4 && git add 服务器/routes/admin.js 服务器/routes/booking.js miniprogram/pages/booking-form/ miniprogram/pages/admin/ miniprogram/pages/admin-annual-report/ miniprogram/utils/api.ts miniprogram/utils/types.ts miniprogram/utils/constants.ts miniprogram/app.json && git commit -m \"feat: 添加年度报告功能和领导来访标识\n\n- 修复统计界面角色分布数据同步问题\n- 在预约表单中添加领导来访开关按钮\n- 新增年度报告功能（高频词统计、来访人数、领导来访统计）\n- 创建年度报告页面和API接口\n- 更新类型定义和API封装\" && git push origin main"
else
    echo "❌ 添加失败"
fi

echo ""

