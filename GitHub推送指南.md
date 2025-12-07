# 🚀 GitHub 推送指南

## 📋 前置准备

### 1. 确保 Git 已安装并配置

如果 Git 命令不可用，请：
1. 重新打开终端（Git 安装后需要重启终端）
2. 或手动添加到 PATH 环境变量

### 2. 配置 Git 用户信息（如果还没配置）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 🚀 推送步骤

### 步骤 1：初始化 Git 仓库（如果还没有）

在项目根目录 `F:\test4` 下执行：

```bash
cd F:\test4
git init
```

### 步骤 2：添加所有文件

```bash
git add .
```

### 步骤 3：提交代码

```bash
git commit -m "初始提交：中国监狱历史文化展览馆智慧预约与文化传播平台"
```

### 步骤 4：在 GitHub 创建仓库

1. 登录 GitHub：https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `prison-museum-platform`（或你喜欢的名字）
   - Description: `中国监狱历史文化展览馆智慧预约与文化传播平台`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 步骤 5：添加远程仓库并推送

GitHub 会显示仓库地址，类似：`https://github.com/你的用户名/prison-museum-platform.git`

执行以下命令（替换为你的实际仓库地址）：

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/prison-museum-platform.git

# 推送代码
git branch -M main
git push -u origin main
```

如果使用 SSH（需要配置 SSH key）：

```bash
git remote add origin git@github.com:你的用户名/prison-museum-platform.git
git branch -M main
git push -u origin main
```

## 📝 完整命令示例

```bash
# 1. 进入项目目录
cd F:\test4

# 2. 初始化仓库（如果还没有）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "初始提交：中国监狱历史文化展览馆智慧预约与文化传播平台"

# 5. 添加远程仓库（替换为你的实际地址）
git remote add origin https://github.com/你的用户名/prison-museum-platform.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

## ⚠️ 注意事项

### 已排除的文件

`.gitignore` 已配置，以下文件**不会**被推送：
- `node_modules/` - 依赖包
- `服务器/data/` - 数据库文件
- `服务器/uploads/` - 上传文件
- `*.zip`, `*.tar.gz` - 打包文件
- `project.private.config.json` - 私有配置

### 敏感信息

推送前请检查：
- ✅ 没有包含敏感信息（API密钥、密码等）
- ✅ `project.private.config.json` 已在 `.gitignore` 中
- ✅ 环境变量文件 `.env` 已在 `.gitignore` 中

## 🔄 后续更新

推送代码后，后续更新使用：

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交
git commit -m "更新说明"

# 4. 推送
git push
```

## 🆘 常见问题

### Q: 提示 "fatal: not a git repository"
**A**: 需要在项目根目录执行 `git init`

### Q: 提示 "remote origin already exists"
**A**: 先删除再添加：
```bash
git remote remove origin
git remote add origin https://github.com/你的用户名/prison-museum-platform.git
```

### Q: 推送时要求输入用户名密码
**A**: 
- 使用 Personal Access Token（推荐）
- 或配置 SSH key

### Q: 文件太大无法推送
**A**: 检查 `.gitignore` 是否正确排除了大文件（如 `node_modules/`）

## 📚 相关资源

- GitHub 文档：https://docs.github.com
- Git 教程：https://git-scm.com/docs

