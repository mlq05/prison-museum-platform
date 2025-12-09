# 数据库服务使用说明

## 📋 概述

本项目使用腾讯云开发数据库（CloudBase Database）作为数据存储，所有数据库操作都通过统一的服务层进行。

## 🏗️ 架构说明

### 目录结构

```
服务器/db/
├── database.js          # 数据库连接和初始化
├── collections.js       # 集合操作服务层（CRUD封装）
├── database-schema.md   # 数据库架构文档
└── README.md           # 本文件
```

### 数据库集合

系统包含以下数据库集合：

1. **users** - 用户账号信息
2. **admins** - 管理员账号信息
3. **bookings** - 预约信息
4. **halls** - 展区信息
5. **feedbacks** - 用户反馈信息
6. **collections** - 用户收藏信息
7. **certificates** - 电子证书信息
8. **visit_settings** - 参观时段设置
9. **ar_checkins** - AR打卡记录

详细字段说明请参考 `database-schema.md`。

## 🚀 使用方法

### 1. 导入数据库服务

```javascript
const { collections } = require('../db/database');
// 或
const { users, bookings, halls, feedbacks } = require('../db/database').collections;
```

### 2. 用户操作示例

```javascript
// 查询用户
const user = await collections.users.findByOpenId('openid_123');

// 创建用户
const newUser = await collections.users.create({
  openId: 'openid_123',
  role: 'visitor',
  name: '张三',
  phone: '13800138000',
});

// 更新用户信息
const updatedUser = await collections.users.update('openid_123', {
  name: '李四',
  phone: '13900139000',
});
```

### 3. 预约操作示例

```javascript
// 创建预约
const booking = await collections.bookings.create({
  userId: 'openid_123',
  userName: '张三',
  bookingDate: '2025-12-08',
  bookingTimeSlot: 'morning1',
  visitorCount: 2,
});

// 查询用户预约列表
const { list, total } = await collections.bookings.listByUser('openid_123', {
  status: 'pending',
  page: 1,
  pageSize: 10,
});

// 更新预约状态
await collections.bookings.updateStatus(bookingId, 'approved', {
  reviewedBy: 'admin_id',
  reviewedAt: Date.now(),
});
```

### 4. 展区操作示例

```javascript
// 查询所有展区
const halls = await collections.halls.list();

// 查询展区详情
const hall = await collections.halls.findById('hall_id');

// 创建展区
const newHall = await collections.halls.create({
  name: '古代监狱展区',
  description: '展示古代监狱制度...',
  floor: 1,
  order_index: 1,
});
```

### 5. 反馈操作示例

```javascript
// 创建反馈
const feedback = await collections.feedbacks.create({
  userId: 'openid_123',
  userName: '张三',
  type: 'suggestion',
  content: '建议增加AR互动功能',
  rating: 5,
});

// 查询用户反馈
const userFeedbacks = await collections.feedbacks.listByUser('openid_123');

// 查询公开反馈（互动墙）
const { list, total } = await collections.feedbacks.listPublic({
  page: 1,
  pageSize: 10,
});
```

## 📝 API 参考

### users 集合

- `findByOpenId(openId)` - 根据openId查询用户
- `create(userData)` - 创建用户
- `update(openId, updateData)` - 更新用户信息
- `list(page, pageSize, filters)` - 查询用户列表（管理员功能）

### admins 集合

- `findByUsername(username)` - 根据用户名查询管理员
- `create(adminData)` - 创建管理员
- `update(adminId, updateData)` - 更新管理员信息
- `list(page, pageSize)` - 查询管理员列表

### bookings 集合

- `create(bookingData)` - 创建预约
- `findById(bookingId)` - 根据ID查询预约
- `listByUser(userId, filters)` - 查询用户预约列表
- `listAll(filters)` - 查询所有预约（管理员功能）
- `listByDateRange(startDate, endDate)` - 查询日期范围内的预约
- `updateStatus(bookingId, status, reviewInfo)` - 更新预约状态
- `countByDateAndTimeSlot(bookingDate, bookingTimeSlot)` - 统计时段预约人数

### halls 集合

- `list()` - 查询所有展区
- `findById(hallId)` - 查询展区详情
- `create(hallData)` - 创建展区
- `update(hallId, updateData)` - 更新展区信息
- `delete(hallId)` - 删除展区（软删除）

### feedbacks 集合

- `create(feedbackData)` - 创建反馈
- `listByUser(userId)` - 查询用户反馈列表
- `listPublic(filters)` - 查询公开反馈列表
- `updateStatus(feedbackId, status)` - 更新反馈状态

### collections 集合

- `create(collectionData)` - 创建收藏
- `listByUser(userId, type)` - 查询用户收藏列表
- `remove(collectionId)` - 删除收藏
- `checkExists(userId, type, itemId)` - 检查是否已收藏

### certificates 集合

- `create(certificateData)` - 创建证书
- `listByUser(userId)` - 查询用户证书列表
- `findById(certificateId)` - 查询证书详情

## ⚠️ 注意事项

1. **错误处理**：所有数据库操作都应该使用 try-catch 捕获错误
2. **异步操作**：所有集合操作都是异步的，需要使用 `await` 或 `.then()`
3. **数据验证**：在调用集合方法前，应该先验证输入数据的有效性
4. **权限控制**：某些操作（如管理员功能）需要在路由层进行权限验证

## 🔧 错误处理示例

```javascript
try {
  const user = await collections.users.findByOpenId(openId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }
  // 处理用户数据...
} catch (error) {
  console.error('查询用户失败:', error);
  return res.status(500).json({
    success: false,
    message: '查询失败，请稍后重试'
  });
}
```

## 📚 更多信息

- 数据库架构详情：`database-schema.md`
- 云数据库文档：https://docs.cloudbase.net/database/introduce.html

