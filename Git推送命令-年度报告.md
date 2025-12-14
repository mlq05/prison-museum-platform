# Git Bash 推送命令 - 年度报告功能

## 方式一：使用脚本文件（推荐）

```bash
# 1. 确保脚本有执行权限
chmod +x Git推送-年度报告功能.sh

# 2. 运行脚本
./Git推送-年度报告功能.sh
```

## 方式二：手动执行命令

### 1. 检查当前状态
```bash
git status
```

### 2. 添加修改的文件
```bash
git add 服务器/routes/admin.js
git add 服务器/routes/booking.js
git add miniprogram/pages/booking-form/
git add miniprogram/pages/admin/
git add miniprogram/pages/admin-annual-report/
git add miniprogram/utils/api.ts
git add miniprogram/utils/types.ts
git add miniprogram/utils/constants.ts
git add miniprogram/app.json
```

### 3. 提交更改
```bash
git commit -m "feat: 添加年度报告功能和领导来访标识

- 修复统计界面角色分布数据同步问题
- 在预约表单中添加领导来访开关按钮
- 新增年度报告功能（高频词统计、来访人数、领导来访统计）
- 创建年度报告页面和API接口
- 更新类型定义和API封装"
```

### 4. 推送到 GitHub
```bash
git push origin main
```

## 如果遇到问题

### 问题1：需要身份验证
```bash
# 配置 Git 凭据存储
git config --global credential.helper store

# 或者使用 GitHub Personal Access Token
# 在推送时输入用户名和 Token（而不是密码）
```

### 问题2：敏感信息被阻止
- 访问 GitHub 仓库的 Security 页面
- 找到被阻止的 secret
- 点击 "Allow this secret" 允许推送

### 问题3：提交被拒绝（分支保护）
```bash
# 检查远程分支
git remote -v

# 如果需要，切换到 main 分支
git checkout main

# 拉取最新代码（如果有冲突）
git pull origin main

# 然后重新推送
git push origin main
```

## 一键命令（复制粘贴）

```bash
git add 服务器/routes/admin.js 服务器/routes/booking.js miniprogram/pages/booking-form/ miniprogram/pages/admin/ miniprogram/pages/admin-annual-report/ miniprogram/utils/api.ts miniprogram/utils/types.ts miniprogram/utils/constants.ts miniprogram/app.json && git commit -m "feat: 添加年度报告功能和领导来访标识

- 修复统计界面角色分布数据同步问题
- 在预约表单中添加领导来访开关按钮
- 新增年度报告功能（高频词统计、来访人数、领导来访统计）
- 创建年度报告页面和API接口
- 更新类型定义和API封装" && git push origin main
```

