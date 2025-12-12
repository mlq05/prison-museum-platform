# 中国监狱历史文化展览馆智慧预约与文化传播平台

> 中央司法警官学院设计创新大赛 - 一等奖冲刺版

## 📋 项目简介

本项目是一个基于微信小程序的智慧预约与文化传播平台，专注于"监狱历史文化展览馆"的数字化升级。项目融合了**智慧预约管理**和**轻量化AR技术（A-frame + AR.js）**，旨在打造一个功能完整、体验流畅、技术创新的文化传播平台。

### 核心亮点

- 🎯 **功能深度**：完整的预约流程、身份核验、后台管理、数据可视化
- 🚀 **技术创新**：A-frame + AR.js 实现轻量化webAR，无需安装APP
- 🎨 **文化契合**：庄重文化风格设计，完美契合法治文化主题
- ⚡ **体验极致**：流畅交互、智能导览、AR打卡、知识闯关

## 🛠 技术栈

### 前端技术
- **框架**：微信小程序（TypeScript）
- **渲染引擎**：Skyline（高性能渲染）
- **AR技术**：A-frame 1.4.0+ + AR.js 3.4.0+（WebAR）
- **样式**：WXSS（支持CSS变量）
- **组件框架**：Glass-easel

### 后端技术
- **服务器**：Node.js + Express
- **数据库**：腾讯云开发数据库（CloudBase Database）
- **认证**：JWT（jsonwebtoken）
- **文件上传**：Multer
- **加密**：bcryptjs
- **工具库**：Moment.js（日期处理）
- **云服务**：腾讯云开发 SDK（@cloudbase/node-sdk）

### 云服务
- **云函数**：微信云开发（可选）
- **云存储**：微信云存储（可选）
- **静态托管**：云开发静态网站托管（AR页面）

### 开发工具
- **IDE**：微信开发者工具
- **语言**：TypeScript（小程序端）、JavaScript（服务器端）
- **版本控制**：Git
- **包管理**：npm

## 📁 项目结构

```
test4/
├── miniprogram/              # 小程序前端
│   ├── app.ts                 # 应用入口
│   ├── app.json               # 应用配置
│   ├── app.wxss              # 全局样式
│   ├── pages/                # 页面目录
│   │   ├── index/            # 首页
│   │   ├── booking/          # 预约首页
│   │   ├── booking-calendar/ # 预约日历
│   │   ├── booking-form/     # 预约表单
│   │   ├── booking-list/     # 预约列表
│   │   ├── booking-detail/   # 预约详情
│   │   ├── booking-success/  # 预约成功
│   │   ├── ar-experience/    # AR体验入口
│   │   ├── ar-native/        # 原生AR（xr-frame）
│   │   ├── ar-link/          # AR链接分享
│   │   ├── ar-webview/       # AR WebView
│   │   ├── ar-guide/         # AR导览
│   │   ├── ar-xr/            # XR框架AR
│   │   ├── exhibition-halls/ # 展馆导览
│   │   ├── knowledge-game/   # 知识闯关
│   │   ├── knowledge-result/ # 闯关结果
│   │   ├── certificate/      # 证书页面
│   │   ├── my/               # 我的
│   │   ├── my-collections/   # 我的收藏
│   │   ├── my-certificates/  # 我的证书
│   │   ├── admin/            # 后台管理
│   │   ├── admin-booking/    # 预约管理
│   │   ├── admin-statistics/ # 数据统计
│   │   ├── admin-halls/      # 展区管理
│   │   ├── interactive-wall/ # 互动墙
│   │   └── feedback/         # 反馈
│   ├── components/           # 组件目录
│   │   ├── navigation-bar/   # 导航栏组件
│   │   └── xr-frame/         # XR框架组件
│   ├── utils/                # 工具函数
│   │   ├── api.ts           # API封装
│   │   ├── common.ts        # 通用工具
│   │   ├── types.ts         # 类型定义
│   │   ├── constants.ts     # 常量定义
│   │   ├── date.ts          # 日期工具
│   │   ├── questionGenerator.ts # 题目生成器
│   │   └── util.ts          # 其他工具
│   ├── ar-pages/            # AR页面（web-view）
│   │   ├── marker-ar-simple.html # A-frame + AR.js AR页面
│   │   └── libs/            # AR库文件
│   │       ├── aframe.min.js
│   │       ├── aframe-ar.js
│   │       ├── camera_para.dat
│   │       └── hiro.patt
│   └── assets/              # 静态资源
│       ├── images/          # 图片
│       └── icons/           # 图标
│
├── 服务器/                   # Node.js 后端服务器
│   ├── server.js            # 服务器入口
│   ├── package.json         # 依赖配置
│   ├── Dockerfile           # Docker构建文件
│   ├── cloudbaserc.json     # 云开发配置文件
│   ├── db/                  # 数据库服务层
│   │   ├── database.js      # 数据库连接和初始化
│   │   ├── collections.js   # 集合操作服务层（CRUD封装）
│   │   ├── database-schema.md # 数据库架构文档
│   │   └── README.md        # 数据库使用说明
│   ├── routes/              # 路由
│   │   ├── admin.js        # 管理员路由
│   │   ├── ar.js           # AR相关路由
│   │   ├── booking.js      # 预约路由
│   │   ├── certificate.js  # 证书路由
│   │   ├── collection.js   # 收藏路由
│   │   ├── feedback.js     # 反馈路由
│   │   ├── game.js         # 游戏路由
│   │   ├── hall.js         # 展区路由
│   │   └── user.js         # 用户路由
│   ├── middleware/          # 中间件
│   │   ├── auth.js         # 认证中间件
│   │   ├── errorHandler.js # 错误处理
│   │   └── logger.js       # 日志中间件
│   ├── scripts/             # 脚本
│   │   ├── init-db.js      # 数据库初始化脚本
│   │   └── init-database.js # 数据库初始化脚本（备用）
│   └── uploads/             # 上传文件目录（云托管使用/tmp/uploads）
│       ├── images/         # 图片
│       └── audio/          # 音频
│
├── functions/               # 云函数（可选）
│   └── getARUrl/           # 获取AR URL云函数
│       ├── index.js
│       └── package.json
│
├── docs/                    # 文档目录
│   ├── README.md           # 项目文档
│   ├── API_CONFIG.md       # API配置说明
│   ├── AR功能实现完整指南.md
│   ├── AR功能完整测试指南.md
│   ├── CLOUD_SETUP_GUIDE.md
│   └── 服务器/             # 服务器相关文档
│
├── typings/                 # TypeScript类型定义
├── package.json            # 根目录依赖
├── tsconfig.json           # TypeScript配置
├── project.config.json     # 小程序项目配置
└── project.private.config.json # 私有配置
```

## 🎯 核心功能模块

### 1. 预约服务模块

- ✅ 日历视图选择日期和时段
- ✅ 多角色预约（学生/教职工/校外访客）
- ✅ 身份核验（对接学校统一身份认证系统）
- ✅ 剩余名额动态预警（≤5人时标红提示）
- ✅ 候补排队机制
- ✅ 预约记录管理（查看、取消）
- ✅ 预约详情查看
- ✅ 导出预约凭证（PDF格式）

### 2. AR体验模块（核心创新）

- ✅ A-frame + AR.js 轻量化webAR
- ✅ Marker识别（二维码+图像双识别模式）
- ✅ 3D场景复原（民国监狱、改造工具等）
- ✅ 语音+文字双解说
- ✅ 交互探索（点击模型查看知识点）
- ✅ AR打卡任务（3-5个打卡点）
- ✅ 专属电子勋章
- ✅ 多种AR实现方式（WebView、原生xr-frame、链接分享）

### 3. 展馆导览模块

- ✅ 展区列表展示
- ✅ 展区详情介绍
- ✅ 智能路线推荐
- ✅ LBS定位导航
- ✅ 收藏功能

### 4. 知识闯关模块

- ✅ 10道题目闯关
- ✅ 绑定AR内容
- ✅ 成绩统计
- ✅ 证书生成

### 5. 后台管理模块

- ✅ 预约审核（批量通过/驳回）
- ✅ 数据可视化看板
- ✅ 异常预约智能预警
- ✅ 展区管理（AR模型、marker上传）
- ✅ 数据导出（Excel格式）
- ✅ 时段配置管理

### 6. 用户中心模块

- ✅ 个人信息管理
- ✅ 我的预约
- ✅ 我的收藏
- ✅ 我的证书
- ✅ 参观反馈

### 7. 互动功能模块

- ✅ 互动墙（公开反馈展示）
- ✅ 反馈提交
- ✅ 证书分享

## 🚀 安装与运行

### 前置要求

1. **微信开发者工具**（最新版）
2. **Node.js** 16+ （用于服务器和云函数开发）
3. **微信小程序账号**（需要配置服务器域名白名单）
4. **npm** 或 **yarn** 包管理器

### 安装步骤

#### 1. 克隆项目

```bash
git clone [项目地址]
cd test4
```

#### 2. 安装小程序依赖

```bash
cd miniprogram
npm install
```

#### 3. 安装服务器依赖

```bash
cd ../服务器
npm install
```

#### 4. 初始化数据库

```bash
npm run init-db
```

#### 5. 配置小程序

1. 在微信开发者工具中导入项目（选择 `test4` 目录）
2. 配置 `project.config.json` 中的 `appid`
3. 在 `app.ts` 中配置云环境ID（如果使用云开发）
4. 在 `miniprogram/utils/api.ts` 中配置服务器地址：
   ```typescript
   // 开发环境：http://localhost:3000/api
   // 真机调试：http://[你的IP]:3000/api
   // 生产环境：https://your-domain.com/api
   const BASE_URL = 'http://localhost:3000/api';
   ```

#### 6. 配置服务器域名

在微信公众平台配置服务器域名白名单：
- request合法域名：`http://localhost:3000`（开发环境）
- uploadFile合法域名：同上
- downloadFile合法域名：同上

#### 7. 配置AR页面域名

1. 将 `miniprogram/ar-pages/` 目录部署到HTTPS服务器
2. 在微信公众平台配置 `web-view` 域名白名单
3. 或使用云开发静态网站托管

#### 8. 启动服务器

```bash
cd 服务器
npm start
# 或开发模式（自动重启）
npm run dev
```

服务器默认运行在 `http://localhost:3000`

#### 9. 运行小程序

1. 在微信开发者工具中点击"编译"
2. 预览或上传代码

### 快速启动脚本

项目提供了快速启动脚本：

- **Windows**: `启动AR服务器.bat` 或 `启动AR服务器.ps1`
- **安装依赖**: `npm安装到miniprogram.bat`

## 📖 开发指南

### 添加新页面

1. 在 `miniprogram/pages/` 目录下创建页面文件夹
2. 在 `app.json` 的 `pages` 数组中添加页面路径
3. 创建页面文件（.ts, .wxml, .wxss, .json）

### 添加API接口

1. 在 `服务器/routes/` 目录下找到对应的路由文件
2. 添加新的路由处理函数
3. 在 `miniprogram/utils/api.ts` 中添加对应的API调用函数

### 添加AR模型

1. 将模型文件（glb/gltf格式，≤5MB）上传到服务器或云存储
2. 在展区管理后台配置模型URL
3. 更新 `ar-pages/marker-ar-simple.html` 中的模型加载逻辑

### 添加云函数

1. 在 `functions/` 目录下创建函数文件夹
2. 编写云函数代码
3. 在微信开发者工具中上传部署

### 数据库操作

项目使用**腾讯云开发数据库**（CloudBase Database）作为数据存储。

#### 数据库集合

系统包含以下9个数据库集合：

1. **users** - 用户账号信息
2. **admins** - 管理员账号信息（默认账号：`zysfjgxy` / `123456`）
3. **bookings** - 预约信息
4. **halls** - 展区信息
5. **feedbacks** - 用户反馈信息
6. **collections** - 用户收藏信息
7. **certificates** - 电子证书信息
8. **visit_settings** - 参观时段设置
9. **ar_checkins** - AR打卡记录

详细字段说明请参考 `服务器/db/database-schema.md`

#### 数据库初始化

系统启动时会自动初始化数据库和默认管理员账号。

手动初始化：
```bash
cd 服务器
npm run init-db
```

#### 数据库服务使用

所有数据库操作都通过统一的服务层进行：

```javascript
const { collections } = require('./db/database');

// 查询用户
const user = await collections.users.findByOpenId('openid_123');

// 创建预约
const booking = await collections.bookings.create({...});
```

详细API参考请查看 `服务器/db/README.md`

## 🎨 界面设计规范

### 配色方案

- **主色调**：庄重藏青 `#1A365D`
- **辅助色**：文化米白 `#F5F1E6`
- **强调色**：科技蓝 `#409EFF`
- **文字色**：主文字 `#1A365D`，次要文字 `#666666`

### 字体规范

- **正文**：PingFang SC, 思源黑体
- **标题**：STKaiti, 方正楷体

### 交互规范

- 页面转场：核心页面使用"卷轴展开/科技感溶解"动画
- 加载状态：骨架屏 + 进度条
- 错误提示：抖动提示 + 错误图标

## 🔧 AR功能使用说明

### 开发环境配置

1. **AR页面部署**
   - 将 `miniprogram/ar-pages/` 目录部署到HTTPS服务器
   - 配置域名白名单（微信公众平台）

2. **Marker生成**
   - 使用AR.js marker生成工具生成pattern marker
   - 将marker图片放到 `ar-pages/libs/` 或服务器

3. **3D模型准备**
   - 使用Blender等工具创建模型
   - 导出为glb/gltf格式（优化到≤5MB）
   - 上传到云存储或服务器，获取访问URL

### AR页面通信

小程序与AR页面通过 `postMessage` 通信：

```javascript
// 小程序向AR页面发送消息
webView.postMessage({ data: { type: 'command', action: 'reset' } });

// AR页面向小程序发送消息
window.wx.miniProgram.postMessage({
  data: { type: 'checkin_success', pointId: 'point1' }
});
```

### AR实现方式

项目支持多种AR实现方式：

1. **WebView AR**（推荐）：使用 A-frame + AR.js，兼容性好
2. **原生AR**：使用 xr-frame，性能更好但需要基础库支持
3. **链接分享**：生成AR链接，可在浏览器中打开

## 📡 API接口说明

### 基础URL

- 开发环境：`http://localhost:3000/api`
- 生产环境：根据实际部署配置

### 主要接口

#### 预约相关
- `GET /api/booking/calendar` - 获取预约日历
- `POST /api/booking/create` - 创建预约
- `GET /api/booking/list` - 获取预约列表
- `GET /api/booking/detail` - 获取预约详情
- `POST /api/booking/cancel` - 取消预约

#### 用户相关
- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/update` - 更新用户信息

#### 展区相关
- `GET /api/hall/list` - 获取展区列表
- `GET /api/hall/detail` - 获取展区详情

#### 管理员相关
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/booking/list` - 获取预约列表（管理）
- `POST /api/admin/booking/review` - 审核预约
- `GET /api/admin/statistics` - 获取统计数据

#### AR相关
- `GET /api/ar/url` - 获取AR页面URL
- `POST /api/ar/checkin` - AR打卡

详细API文档请参考 `docs/API_CONFIG.md`

## ⚡ 性能优化

- ✅ 首屏加载时间 ≤ 1.5秒
- ✅ AR页面启动时间 ≤ 2秒
- ✅ 模型加载时间 ≤ 3秒
- ✅ 懒加载非当前路线的AR模型
- ✅ 图片压缩与CDN加速
- ✅ 数据库查询优化
- ✅ 接口响应缓存

## 🔒 安全措施

- ✅ JWT Token认证
- ✅ 密码加密存储（bcrypt）
- ✅ 敏感信息加密
- ✅ 请求频率限制
- ✅ SQL注入防护
- ✅ XSS防护

## 📱 兼容性

- **iOS**：12.0+
- **Android**：8.0+
- **微信版本**：7.0+
- **基础库版本**：3.0.0+（Skyline渲染器）

## 🐛 常见问题

### 1. 真机调试无法连接服务器

**解决方案**：
- 确保手机和电脑在同一局域网
- 将 `api.ts` 中的 `BASE_URL` 改为电脑的局域网IP
- 确保防火墙允许3000端口

### 2. AR页面无法加载

**解决方案**：
- 检查AR页面是否部署到HTTPS服务器
- 检查域名是否已配置到微信公众平台白名单
- 检查网络连接

### 3. 云开发初始化失败

**解决方案**：
- 检查是否已开通云开发
- 检查 `app.ts` 中的云环境ID配置
- 可以在没有云开发的情况下使用本地服务器

### 4. 数据库初始化失败

**解决方案**：
- 确保 `服务器/data/` 目录存在且有写权限
- 检查 Node.js 版本是否 ≥ 16
- 重新运行 `npm run init-db`

### 5. 部署后构建失败

**解决方案**：
- **推荐**：使用 CloudBase CLI 部署（`cloudbase run deploy`），避免 ZIP 路径问题
- 或使用 Git 仓库部署方式
- 检查 `Dockerfile` 是否存在且配置正确
- 检查 `package.json` 中的依赖配置

### 6. 域名配置问题

**解决方案**：
- 服务器域名必须以 `https://` 开头
- 业务域名（web-view）**不要**包含 `https://`
- 确保域名已通过验证（业务域名需要上传验证文件）
- 开发环境可以使用云托管测试域名（会有警告提示，但不影响使用）

## ☁️ 云端部署指南

### 一、服务器部署（云托管）

#### 方式一：使用 CloudBase CLI 部署（推荐）

1. **安装 CloudBase CLI**：
   ```bash
   npm install -g @cloudbase/cli
   ```

2. **登录**：
   ```bash
   cloudbase login
   ```

3. **部署**（在 `服务器` 目录下）：
   ```bash
   cd 服务器
   deploy.bat
   ```
   或手动执行：
   ```bash
   cloudbase run deploy -e prison-museum-dev-8e6hujc6eb768b -s museum-api --containerPort 80
   ```

4. **配置环境变量**（在云开发控制台）：
   ```
   NODE_ENV=production
   JWT_SECRET=你的随机密钥（至少32位）
   ```

5. **获取服务地址**：部署成功后获取 `https://museum-api-xxxxx.tcb.qcloud.la`

#### 方式二：使用 ZIP 包上传

1. 打包服务器代码：
   ```bash
   cd 服务器
   打包.bat  # Windows
   # 或
   ./打包.sh  # Linux/Mac
   ```

2. 登录 [云开发控制台](https://console.cloud.tencent.com/tcb)

3. 进入"云托管" → "服务管理" → 点击"新建版本" → 选择"本地上传"

4. 上传 `server.zip`，配置环境变量并部署

#### 方式三：使用 Git 仓库部署（推荐生产环境）

1. 将代码推送到 Git 仓库（GitHub/GitLab/码云）

2. 在云开发控制台选择"Git 仓库"部署方式

3. 配置部署参数：
   - **Git 仓库**：填写仓库地址（如：`mlq05/prison-museum-platform`）
   - **分支**：`main`
   - **服务名称**：`museum-api`
   - **部署类型**：容器型服务
   - **访问端口**：`80`
   - **服务端口**：`80`
   - **目标目录**：`服务器` ⚠️ 必须填写
   - **Dockerfile 名称**：`Dockerfile`

4. 配置环境变量（JSON格式）：
   ```json
   {
     "NODE_ENV": "production",
     "PORT": "80",
     "JWT_SECRET": "你的随机密钥（至少32位）",
     "TCB_ENV": "你的云开发环境ID",
     "TCB_SECRET_ID": "你的SecretId",
     "TCB_SECRET_KEY": "你的SecretKey",
     "COS_BUCKET": "你的COS存储桶名（可选）",
     "COS_REGION": "ap-shanghai（可选）"
   }
   ```

5. 点击"部署"按钮，等待构建完成（约3-5分钟）

**获取 SecretId 和 SecretKey**：
- 访问：https://console.cloud.tencent.com/cam/capi
- 创建或查看API密钥
- 复制 `SecretId` 和 `SecretKey`

### 二、AR页面部署（静态网站托管）

#### 需要上传的文件

```
miniprogram/ar-pages/
├── marker-ar-simple.html        ✅ AR页面主文件
└── libs/                        ✅ AR库文件目录
    ├── aframe-ar.js             ✅ AR.js库
    ├── aframe.min.js            ✅ A-Frame库
    ├── camera_para.dat          ✅ 相机参数文件
    └── hiro.patt                ✅ Hiro marker模式文件
```

#### 部署步骤

**方法一：通过控制台上传（推荐）**

1. 登录 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境：`prison-museum-dev-8e6hujc6eb768b`（或你的环境）
3. 进入"静态网站托管" → 开通服务（如果未开通）
4. 点击"上传文件"或"上传文件夹"
5. 选择整个 `miniprogram/ar-pages/` 目录并上传

**方法二：使用 CLI 上传**

```bash
# 安装 CLI（如果未安装）
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 上传 AR 页面
cd miniprogram/ar-pages
cloudbase hosting:deploy . --envId prison-museum-dev-8e6hujc6eb768b
```

#### 获取访问地址

上传完成后，在静态网站托管页面查看"默认域名"：
- 格式如：`https://prison-museum-dev-xxxxx.tcloudbaseapp.com`
- **AR页面完整地址**：`https://prison-museum-dev-xxxxx.tcloudbaseapp.com/ar-pages/marker-ar-simple.html`

#### 测试 AR 页面

在浏览器中访问：
```
https://prison-museum-dev-xxxxx.tcloudbaseapp.com/ar-pages/marker-ar-simple.html?hallId=1
```

应该能看到 AR 页面正常加载。

### 三、更新小程序配置

#### 1. 更新 API 地址

修改 `miniprogram/utils/api.ts`：
```typescript
const BASE_URL = 'https://museum-api-xxxxx.tcb.qcloud.la/api';
```

#### 2. 更新 AR 页面 URL

修改 `miniprogram/pages/ar-link/ar-link.ts`：
```typescript
const cloudHostingUrl = 'https://xxxxx.tcloudbaseapp.com';
```

#### 3. 配置服务器域名白名单

在微信公众平台配置服务器域名：

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入 **"开发" → "开发管理" → "开发设置"**
3. 找到 **"服务器域名"** 部分，配置以下域名：

   **服务器域名**：
   - **request合法域名**：`https://museum-api-xxxxx.tcb.qcloud.la`
   - **uploadFile合法域名**：`https://museum-api-xxxxx.tcb.qcloud.la`
   - **downloadFile合法域名**：`https://museum-api-xxxxx.tcb.qcloud.la`

   ⚠️ **注意**：
   - 必须以 `https://` 开头
   - 不要包含路径，只填写域名部分
   - 如果看到警告"云托管域名仅用作测试使用"，这是正常的，开发/测试阶段可以使用

#### 4. 配置业务域名（web-view）

配置 AR 页面的 web-view 域名：

1. 在同一页面找到 **"业务域名"** 或 **"web-view合法域名"** 部分
2. 填写静态网站托管域名（**不需要** `https://`）：
   ```
   prison-museum-dev-xxxxx.tcloudbaseapp.com
   ```
3. 下载验证文件并上传到静态网站托管根目录
4. 等待审核通过（通常几分钟内生效）

### 四、重要注意事项

#### 数据库存储

- ✅ 项目已使用**腾讯云开发数据库**，数据持久化存储
- ✅ 数据库集合会在首次启动时自动创建
- ✅ 默认管理员账号：用户名 `zysfjgxy`，密码 `123456`

#### 文件上传

- ⚠️ 上传的文件存储在 `/tmp/uploads`，服务重启后文件会丢失
- 💡 建议使用云存储（COS）存储文件

#### 环境变量

必须在云开发控制台配置以下环境变量：
- `NODE_ENV=production` - 运行环境
- `PORT=80` - 服务端口（可选，默认80）
- `JWT_SECRET=你的随机密钥（至少32位）` - JWT签名密钥
- `TCB_ENV=你的云开发环境ID` - 云开发环境ID
- `TCB_SECRET_ID=你的SecretId` - 腾讯云API密钥ID
- `TCB_SECRET_KEY=你的SecretKey` - 腾讯云API密钥
- `COS_BUCKET=你的存储桶名` - 对象存储桶名（可选）
- `COS_REGION=ap-shanghai` - 对象存储地域（可选）

### 五、部署检查清单

#### 服务器部署检查
- [ ] 已创建云托管服务
- [ ] 已上传代码并部署成功（或Git仓库已连接）
- [ ] 已配置所有必需的环境变量（`NODE_ENV`、`JWT_SECRET`、`TCB_ENV`、`TCB_SECRET_ID`、`TCB_SECRET_KEY`）
- [ ] 已获取服务地址
- [ ] 已测试健康检查接口（`/health`）
- [ ] 数据库连接成功（查看日志确认）

#### AR页面部署检查
- [ ] 已开通静态网站托管
- [ ] 已上传 `marker-ar-simple.html`
- [ ] 已上传 `libs/` 目录及所有库文件
- [ ] 文件结构正确
- [ ] 已获取访问地址
- [ ] 已测试 AR 页面访问

#### 小程序配置检查
- [ ] 已更新 API 地址（`miniprogram/utils/api.ts`）
- [ ] 已更新 AR 页面 URL（`miniprogram/pages/ar-link/ar-link.ts`）
- [ ] 已配置服务器域名白名单
- [ ] 已配置业务域名（web-view）
- [ ] 已重新编译小程序
- [ ] 已测试小程序功能

### 六、测试部署

1. **健康检查**：
   ```
   https://museum-api-xxxxx.tcb.qcloud.la/health
   ```
   应返回：
   ```json
   {
     "success": true,
     "message": "服务器运行正常",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **API 测试**：
   ```
   https://museum-api-xxxxx.tcb.qcloud.la/api/hall/list
   ```
   应返回展区列表数据

3. **AR页面测试**：
   ```
   https://prison-museum-dev-xxxxx.tcloudbaseapp.com/ar-pages/marker-ar-simple.html?hallId=1
   ```
   应能看到 AR 页面正常加载

## 📊 数据库架构

### 集合说明

项目使用腾讯云开发数据库，包含9个集合：

| 集合名 | 说明 | 主要字段 |
|--------|------|----------|
| users | 用户信息 | openId, role, name, phone |
| admins | 管理员信息 | username, passwordHash, role |
| bookings | 预约信息 | userId, bookingDate, bookingTimeSlot, status |
| halls | 展区信息 | name, description, arModelUrl, arMarkerImage |
| feedbacks | 反馈信息 | userId, content, rating, status |
| collections | 收藏信息 | userId, type, itemId |
| certificates | 证书信息 | userId, type, title, certificateNumber |
| visit_settings | 时段设置 | date, timeSlotId, capacity |
| ar_checkins | AR打卡 | userId, hallId, checkInPointId |

详细字段说明和索引配置请参考 `服务器/db/database-schema.md`

### 默认管理员账号

- **用户名**：`zysfjgxy`
- **密码**：`123456`

系统首次启动时会自动创建该管理员账号。

## 📝 待办事项

- [ ] 完成所有页面的单元测试
- [ ] 添加E2E测试
- [ ] 性能测试与优化
- [ ] 多机型兼容性测试
- [ ] 完善错误处理机制
- [ ] 添加日志系统
- [ ] 文件存储迁移到云存储（COS）

## 📄 许可证

本项目仅供中央司法警官学院设计创新大赛使用。

## 👥 联系方式

如有问题，请联系项目团队。

---

**祝项目顺利，冲刺一等奖！🏆**



