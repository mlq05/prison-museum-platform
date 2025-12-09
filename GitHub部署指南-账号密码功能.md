# 📦 使用 GitHub 部署账号密码登录功能

## ✅ 第一步：确认代码已提交到 GitHub

在部署前，需要确保最新的代码已经推送到 GitHub 仓库：

```bash
# 1. 检查当前更改
git status

# 2. 添加所有更改的文件
git add .

# 3. 提交更改
git commit -m "添加账号密码登录注册功能"

# 4. 推送到 GitHub
git push origin main
```

**重要文件需要包含：**
- ✅ `服务器/routes/user.js` - 包含新路由
- ✅ `服务器/db/collections.js` - 包含 `findByUsername` 方法
- ✅ `服务器/Dockerfile` - 容器配置
- ✅ `服务器/package.json` - 依赖配置

---

## ⚙️ 第二步：配置 GitHub 部署

根据控制台显示的配置页面，按以下设置：

### 基础配置

- **Git 仓库**：`公开仓库`
- **Repository URL**：`https://github.com/mlq05/prison-museum-platform.git`
- **Branch**：`main` ✅
- **服务名称**：`museum-api` ✅
- **部署类型**：`容器型服务` ✅

### 🔧 构建设置（重要！）

点击展开 **"构建设置"** (Build Settings) 部分：

- **构建目录**：`服务器` ⚠️ **这是关键！**
  - 因为 Dockerfile 在 `服务器` 目录下
  - 如果设置为根目录 `.` 会导致构建失败

### 服务端口设置

- **访问端口**：`80` ✅
- **服务端口**：`80` ✅

### 环境变量设置

点击展开 **"环境变量设置"** (Environment Variable Settings)，添加：

```
TCB_ENV = prison-museum-dev-8e6hujc6eb768b
TCB_SECRET_ID = 你的SecretId
TCB_SECRET_KEY = 你的SecretKey
NODE_ENV = production
JWT_SECRET = 你的JWT密钥（至少32位）
PORT = 80
```

---

## 🚀 第三步：开始部署

1. 确认所有配置正确
2. 点击蓝色的 **"部署"** 按钮
3. 等待部署完成（约 3-8 分钟）

---

## ✅ 第四步：验证部署

部署完成后，测试新接口：

### 1. 测试健康检查
```
GET https://museum-api-205770-6-1390408503.sh.run.tcloudbase.com/health
```

### 2. 测试检查用户名接口
```
GET https://museum-api-205770-6-1390408503.sh.run.tcloudbase.com/api/user/check-username?username=test123
```
应该返回：
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "用户名可用"
  }
}
```

### 3. 测试登录接口
```
POST https://museum-api-205770-6-1390408503.sh.run.tcloudbase.com/api/user/login-account
Content-Type: application/json

{
  "username": "test",
  "password": "123456"
}
```

### 4. 在小程序中测试
- 重新编译小程序
- 进入登录/注册页面
- 输入用户名，应该不再出现 404 错误

---

## 🔍 故障排查

### 如果部署失败：

1. **检查构建日志**
   - 在控制台 **"部署版本"** → 点击部署记录 → 查看 **"构建日志"**
   - 检查是否有错误信息

2. **确认构建目录**
   - 必须设置为 `服务器`，不能是 `.` 或其他路径
   - Dockerfile 必须在构建目录的根目录

3. **确认文件存在**
   - 在 GitHub 仓库确认 `服务器/Dockerfile` 存在
   - 确认 `服务器/server.js` 存在
   - 确认 `服务器/package.json` 存在

4. **检查环境变量**
   - 确保所有必需的环境变量都已配置
   - 特别是 `TCB_ENV`、`TCB_SECRET_ID`、`TCB_SECRET_KEY`

### 如果接口仍然 404：

1. **确认代码已推送**
   - 在 GitHub 查看 `服务器/routes/user.js`
   - 确认包含 `router.post('/register'`、`router.post('/login-account'`、`router.get('/check-username'`

2. **重新部署**
   - 在控制台点击 **"重新部署"** 或 **"部署新版本"**
   - 选择最新的 commit

3. **检查服务日志**
   - 在控制台 **"日志"** 标签查看运行时日志
   - 检查是否有路由注册的错误信息

---

## 📝 部署配置检查清单

部署前请确认：

- [ ] 代码已推送到 GitHub `main` 分支
- [ ] 构建目录设置为 `服务器`
- [ ] 端口配置为 `80`
- [ ] 环境变量已全部配置
- [ ] Dockerfile 存在于 `服务器` 目录
- [ ] `服务器/routes/user.js` 包含新路由
- [ ] `服务器/db/collections.js` 包含 `findByUsername` 方法

---

## 🎉 部署成功后

所有账号密码登录功能将可用：

- ✅ 用户注册：`POST /api/user/register`
- ✅ 账号密码登录：`POST /api/user/login-account`
- ✅ 检查用户名：`GET /api/user/check-username`

部署完成后，记得在小程序中测试完整流程！

