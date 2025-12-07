# 中国监狱历史文化展览馆智慧预约与文化传播平台

> 中央司法警官学院设计创新大赛 - 一等奖冲刺版

## 项目简介

本项目是一个基于微信小程序的智慧预约与文化传播平台，专注于"监狱历史文化展览馆"的数字化升级。项目融合了**智慧预约管理**和**轻量化AR技术（A-frame + AR.js）**，旨在打造一个功能完整、体验流畅、技术创新的文化传播平台。

### 核心亮点

- 🎯 **功能深度**：完整的预约流程、身份核验、后台管理、数据可视化
- 🚀 **技术创新**：A-frame + AR.js 实现轻量化webAR，无需安装APP
- 🎨 **文化契合**：庄重文化风格设计，完美契合法治文化主题
- ⚡ **体验极致**：流畅交互、智能导览、AR打卡、知识闯关

## 技术栈

### 前端技术
- **框架**：微信小程序（TypeScript）
- **渲染引擎**：Skyline（高性能渲染）
- **AR技术**：A-frame 1.4.0+ + AR.js 3.4.0+ / xr-frame（基础库内置）
- **样式**：WXSS（支持CSS变量）

### 后端技术
- **方案一**：微信云开发（云函数、云存储、云数据库）
- **方案二**：Node.js + Express + SQLite（本地服务器）

### 开发工具
- **IDE**：微信开发者工具
- **语言**：TypeScript
- **版本控制**：Git

## 项目结构

```
miniprogram/
├── app.ts                 # 应用入口
├── app.json               # 应用配置
├── app.wxss              # 全局样式
├── pages/                # 页面目录
│   ├── index/            # 首页
│   ├── booking/          # 预约首页
│   ├── booking-calendar/ # 预约日历
│   ├── booking-form/     # 预约表单
│   ├── ar-experience/    # AR体验
│   ├── ar-webview/       # AR web-view页面
│   ├── ar-xr/            # AR xr-frame页面
│   ├── exhibition-halls/ # 展馆导览
│   ├── knowledge-game/   # 知识闯关
│   ├── my/               # 我的
│   └── admin/            # 后台管理
├── components/           # 组件目录
│   └── navigation-bar/   # 导航栏组件
├── utils/                # 工具函数
│   ├── api.ts           # API封装
│   ├── common.ts        # 通用工具
│   ├── types.ts         # 类型定义
│   ├── constants.ts     # 常量定义
│   └── date.ts          # 日期工具
├── ar-pages/            # AR页面（web-view）
│   └── marker-ar-simple.html  # A-frame + AR.js AR页面
└── assets/              # 静态资源
    ├── images/          # 图片
    ├── icons/           # 图标
    └── models/          # 3D模型（glb/gltf）

服务器/                   # 本地服务器（可选）
├── server.js            # 服务器入口
├── routes/              # 路由文件
├── db/                  # 数据库
└── middleware/          # 中间件

cloudfunctions/          # 云函数目录（可选）
├── booking/            # 预约相关
├── user/               # 用户相关
└── ar/                 # AR相关
```

## 核心功能模块

### 1. 预约服务模块

- ✅ 日历视图选择日期和时段
- ✅ 多角色预约（学生/教职工/校外访客）
- ✅ 身份核验（对接学校统一身份认证系统）
- ✅ 剩余名额动态预警（≤5人时标红提示）
- ✅ 候补排队机制
- ✅ 预约记录管理
- ✅ 导出预约凭证（PDF格式）

### 2. AR体验模块（核心创新）

#### AR方案说明

项目支持三种AR方案，自动降级：

1. **xr-frame方案**（推荐，功能最完整）
   - 支持Hiro marker识别
   - 支持3D模型显示
   - 需要基础库 ≥ 2.27.1，微信版本 ≥ 8.0.29
   - 如果不可用，自动降级到其他方案

2. **A-frame + AR.js方案**（功能完整）
   - 使用web-view加载HTML页面
   - 支持Hiro marker和3D模型
   - 需要企业主体配置业务域名
   - 文件位置：`miniprogram/ar-pages/marker-ar-simple.html`

3. **原生AR方案**（兼容性最好）
   - 使用小程序原生扫码功能
   - 支持二维码识别
   - 立即可用，无需额外配置

#### AR功能特性

- ✅ marker识别（Hiro marker / 二维码）
- ✅ 3D场景复原（民国监狱、改造工具等）
- ✅ 语音+文字双解说
- ✅ 交互探索（点击模型查看知识点）
- ✅ AR打卡任务（3-5个打卡点）
- ✅ 专属电子勋章

#### Hiro Marker使用

1. **获取Hiro Marker图片**
   - 在线查看：https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg
   - 下载并打印或显示在设备上

2. **识别技巧**
   - 距离：30-50cm最佳
   - 角度：尽量正对，不要倾斜太大
   - 光线：确保充足的光线
   - 稳定性：保持手机稳定

3. **如果识别不到**
   - 检查光线是否充足
   - 检查距离和角度
   - 检查摄像头权限
   - 检查基础库版本（xr-frame需要≥2.27.1）

### 3. 后台管理模块

- ✅ 预约审核（批量通过/驳回）
- ✅ 数据可视化看板
- ✅ 异常预约智能预警
- ✅ 展区管理（AR模型、marker上传）
- ✅ 数据导出（Excel格式）

### 4. 加分功能

- ✅ 知识闯关（10道题，绑定AR内容）
- ✅ 智能导览（LBS + AR导航）
- ✅ 参观反馈互动墙

## 安装与运行

### 前置要求

1. 微信开发者工具（最新版）
2. Node.js 16+ （用于云函数开发或本地服务器）
3. 微信小程序账号

### 方案一：使用云开发（推荐）

#### 1. 开通云开发

1. 在微信开发者工具中点击"云开发"按钮
2. 开通云开发服务
3. 创建云环境（开发版免费）
4. 获取云环境ID

#### 2. 配置云环境ID

打开 `miniprogram/app.ts`，找到 `initCloud()` 方法：

```typescript
const cloudEnvId: string = 'your-cloud-env-id'; // 替换为你的云环境ID
```

#### 3. 创建云函数

1. 在微信开发者工具中，右键点击项目根目录
2. 选择"新建" -> "云函数"
3. 创建以下云函数：
   - `booking` - 预约相关
   - `user` - 用户相关
   - `admin` - 管理相关

#### 4. 创建数据库集合

在云开发控制台创建以下集合：
- `bookings` - 预约记录
- `users` - 用户信息
- `halls` - 展区信息
- `collections` - 收藏记录
- `certificates` - 证书记录
- `feedbacks` - 反馈记录

#### 5. 配置API

打开 `miniprogram/utils/api.ts`，确认：

```typescript
const USE_CLOUD_FUNCTION = true; // 使用云函数
const BASE_URL = ''; // 云函数模式下留空
```

### 方案二：使用本地服务器

#### 1. 安装依赖

```bash
cd 服务器
npm install
```

#### 2. 配置环境变量

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
DB_PATH=./data/database.db
```

⚠️ **重要**：请修改 `JWT_SECRET` 为一个随机字符串！

#### 3. 初始化数据库

```bash
npm run init-db
```

#### 4. 启动服务器

**开发模式：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

#### 5. 配置小程序

打开 `miniprogram/utils/api.ts`：

```typescript
const BASE_URL = 'http://localhost:3000'; // 本地开发
// 或使用内网穿透地址：'https://your-ngrok-url.ngrok.io'
const USE_CLOUD_FUNCTION = false; // 关闭云函数模式
```

#### 6. 真机测试配置

真机测试需要使用内网穿透工具（如 ngrok）：

1. 下载并启动 ngrok：`ngrok http 3000`
2. 获取公网地址（如：`https://abc123.ngrok.io`）
3. 修改 `BASE_URL` 为 ngrok 地址
4. 在微信公众平台配置该域名

### 配置AR页面域名

如果使用A-frame + AR.js方案（web-view）：

1. 将 `miniprogram/ar-pages/` 目录部署到HTTPS服务器
2. 在微信公众平台配置web-view域名白名单
3. 更新 `pages/ar-webview/ar-webview.ts` 中的AR页面URL

### 运行项目

1. 在微信开发者工具中导入项目
2. 配置 `project.config.json` 中的 `appid`
3. 点击"编译"按钮
4. 预览或上传代码

## 开发指南

### 添加新页面

1. 在 `pages/` 目录下创建页面文件夹
2. 在 `app.json` 中添加页面路径
3. 创建页面文件（.ts, .wxml, .wxss, .json）

### 添加AR模型

1. 将模型文件（glb/gltf格式，≤5MB）放到 `assets/models/`
2. 在展区管理后台配置模型URL
3. 更新AR页面中的模型加载逻辑

### 添加云函数

1. 在 `cloudfunctions/` 目录下创建函数文件夹
2. 编写云函数代码
3. 在微信开发者工具中上传部署

### API调用

项目支持两种API模式：

1. **云函数模式**（推荐）
   ```typescript
   const USE_CLOUD_FUNCTION = true;
   // 调用云函数
   wx.cloud.callFunction({
     name: 'booking',
     data: { path: '/booking/create', data: {...} }
   });
   ```

2. **HTTP请求模式**
   ```typescript
   const USE_CLOUD_FUNCTION = false;
   const BASE_URL = 'https://your-api-domain.com';
   // 使用 wx.request
   ```

## 界面设计规范

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

## 性能优化

- ✅ 首屏加载时间 ≤ 1.5秒
- ✅ AR页面启动时间 ≤ 2秒
- ✅ 模型加载时间 ≤ 3秒
- ✅ 懒加载非当前路线的AR模型
- ✅ 图片压缩与CDN加速

## 兼容性

- **iOS**：12.0+
- **Android**：8.0+
- **微信版本**：7.0+
- **基础库版本**：3.0.0+（xr-frame需要≥2.27.1）

## 常见问题

### Q1: 网络请求失败？

**A**: 检查：
- 如果使用云开发，确认云环境ID已配置
- 如果使用本地服务器，确认服务器已启动
- 检查 `USE_CLOUD_FUNCTION` 配置是否正确
- 真机测试需要配置服务器域名或使用内网穿透

### Q2: xr-frame不可用？

**A**: 
- 检查微信版本是否≥8.0.29
- 检查基础库版本是否≥2.27.1
- 如果不可用，系统会自动降级到原生AR方案

### Q3: AR识别失败？

**A**: 
- 检查光线是否充足
- 检查marker距离（30-50cm最佳）
- 检查摄像头权限是否授权
- 确保marker图案清晰

### Q4: 云函数调用失败？

**A**: 检查：
- 云函数是否已部署
- 云环境ID是否正确
- 查看云函数日志中的错误信息

## 待办事项

- [ ] 完成预约表单页面
- [ ] 完成知识闯关页面
- [ ] 完成后台管理页面
- [ ] 完成云函数开发
- [ ] 添加单元测试
- [ ] 性能测试与优化
- [ ] 多机型兼容性测试

## 注意事项

1. **素材准备**：所有AR模型、图片、音频素材需在部署前准备好
2. **域名配置**：web-view页面必须部署到HTTPS服务器
3. **云环境**：需要配置正确的云环境ID
4. **权限申请**：摄像头、位置等权限需要用户授权
5. **内容审核**：所有AR内容需符合官方规范

## 许可证

本项目仅供中央司法警官学院设计创新大赛使用。

## 联系方式

如有问题，请联系项目团队。



