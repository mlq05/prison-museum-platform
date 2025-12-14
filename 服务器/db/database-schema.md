# 数据库架构说明

## 集合列表

### 1. users（用户集合）

存储用户账号信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `openId`: 微信OpenID（唯一标识）
- `role`: 用户角色（`visitor` | `student` | `faculty` | `admin`）
- `name`: 姓名
- `phone`: 手机号
- `studentId`: 学号（学生）
- `workId`: 工号（教职工）
- `unit`: 单位/院系
- `idCard`: 身份证号
- `idCardPhoto`: 身份证照片URL
- `avatarUrl`: 头像URL
- `verified`: 是否已认证（布尔值）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `openId`: 唯一索引

---

### 2. admins（管理员集合）

存储管理员账号信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `username`: 管理员用户名（唯一）
- `passwordHash`: 密码哈希值（bcrypt）
- `role`: 角色（`admin` | `super_admin`）
- `name`: 姓名
- `email`: 邮箱
- `phone`: 手机号
- `permissions`: 权限列表（数组）
- `lastLoginAt`: 最后登录时间
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `username`: 唯一索引

**默认管理员**：
- 用户名：`zysfjgxy`
- 密码：`123456`

---

### 3. bookings（预约集合）

存储用户预约信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `userId`: 用户ID（关联users.openId）
- `userName`: 用户姓名
- `userRole`: 用户角色
- `phone`: 联系电话
- `bookingDate`: 预约日期（格式：YYYY-MM-DD）
- `bookingTimeSlot`: 预约时段（如：`09:00-11:00` 或 `morning1`）
- `visitorCount`: 参观人数
- `status`: 预约状态（`pending` | `approved` | `rejected` | `cancelled` | `completed`）
- `rejectReason`: 驳回原因
- `routeId`: 推荐路线ID
- `arModelsPreloaded`: 预加载的AR模型列表（数组）
- `reviewedBy`: 审核人（管理员ID）
- `reviewedAt`: 审核时间（时间戳）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `userId`: 索引
- `bookingDate`: 索引
- `status`: 索引
- `bookingDate + bookingTimeSlot`: 复合索引（用于查询时段预约）

---

### 4. halls（展区集合）

存储展区信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `name`: 展区名称
- `description`: 展区描述
- `coverImage`: 封面图片URL
- `floor`: 楼层
- `order_index`: 排序索引
- `arMarkerImage`: AR标记图片URL
- `arModelUrl`: AR模型URL
- `arModelSize`: AR模型大小（MB）
- `audioGuideUrl`: 语音导览URL
- `textGuide`: 文字导览内容
- `checkInPoints`: AR打卡点ID列表（数组）
- `isActive`: 是否启用（布尔值）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `isActive`: 索引
- `floor`: 索引
- `order_index`: 索引

---

### 5. feedbacks（反馈集合）

存储用户参观反馈信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `userId`: 用户ID（关联users.openId）
- `userName`: 用户姓名
- `bookingId`: 关联预约ID（可选）
- `type`: 反馈类型（`suggestion` | `complaint` | `praise` | `question`）
- `content`: 反馈内容
- `images`: 反馈图片列表（数组）
- `rating`: 整体评分（1-5）
- `arRating`: AR体验评分（1-5）
- `status`: 审核状态（`pending` | `approved` | `rejected`）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `userId`: 索引
- `status`: 索引
- `createdAt`: 索引（用于排序）

---

### 6. collections（收藏集合）

存储用户收藏信息。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `userId`: 用户ID（关联users.openId）
- `type`: 收藏类型（`knowledge` | `hall` | `model`）
- `itemId`: 收藏项ID
- `itemData`: 收藏项数据（对象，用于快速访问）
- `createdAt`: 创建时间（时间戳）

**索引**：
- `userId`: 索引
- `userId + type + itemId`: 复合唯一索引（防止重复收藏）

---

### 7. certificates（证书集合）

存储用户获得的电子证书。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `userId`: 用户ID（关联users.openId）
- `userName`: 用户姓名
- `type`: 证书类型（`knowledge` | `ar` | `visit`）
- `title`: 证书标题
- `content`: 证书内容/描述
- `certificateNumber`: 证书编号
- `issueDate`: 颁发日期（格式化字符串）
- `arCheckInCount`: AR打卡次数（用于AR证书）
- `gameScore`: 游戏得分（用于知识闯关证书）
- `gameTotalScore`: 游戏总分
- `createdAt`: 创建时间（时间戳）

**索引**：
- `userId`: 索引
- `type`: 索引
- `certificateNumber`: 唯一索引

---

### 8. visit_settings（参观设置集合）

存储管理员配置的参观时段设置。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `date`: 日期（格式：YYYY-MM-DD）
- `timeSlotId`: 时段ID（如：`morning1`）
- `timeRange`: 时段范围（如：`09:00-11:00`）
- `capacity`: 容量（最多可预约人数）
- `maxPerBooking`: 单次预约最多人数
- `isActive`: 是否启用（布尔值）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `date`: 索引
- `date + timeSlotId`: 复合唯一索引

---

### 9. ar_checkins（AR打卡集合）

存储用户AR打卡记录。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `userId`: 用户ID（关联users.openId）
- `hallId`: 展区ID（关联halls._id）
- `checkInPointId`: 打卡点ID
- `checkInTime`: 打卡时间（时间戳）
- `location`: 打卡位置信息（对象，可选）

**索引**：
- `userId`: 索引
- `hallId`: 索引
- `userId + hallId + checkInPointId`: 复合唯一索引（防止重复打卡）

---

### 10. ar_clicks（AR点击统计集合）

存储用户点击AR体验按钮的统计记录。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `hallId`: 展区ID（关联halls._id）
- `userId`: 用户ID（关联users.openId，可选，匿名用户可能为空）
- `clickTime`: 点击时间（时间戳）

**索引**：
- `hallId`: 索引
- `userId`: 索引
- `clickTime`: 索引（用于时间范围查询）

---

### 11. open_days（开放日设置集合）

存储开放日设置信息。开放日无需预约即可参观。

**字段说明**：
- `_id`: 文档ID（自动生成）
- `type`: 类型（`weekday` | `date`）
  - `weekday`: 每周固定星期几（如每周五、六）
  - `date`: 具体日期（如 2025-12-25）
- `weekday`: 星期数（0-6，0=周日，5=周五，6=周六），仅当 type 为 `weekday` 时有值
- `date`: 具体日期（格式：YYYY-MM-DD），仅当 type 为 `date` 时有值
- `description`: 描述信息（可选）
- `createdAt`: 创建时间（时间戳）
- `updatedAt`: 更新时间（时间戳）

**索引**：
- `type`: 索引
- `weekday`: 索引（用于查询固定星期几）
- `date`: 索引（用于查询具体日期）
- `type + weekday`: 复合唯一索引（防止重复的星期几设置）
- `type + date`: 复合唯一索引（防止重复的具体日期设置）

**默认值**：
- 每周五（weekday: 5）
- 每周六（weekday: 6）

---

## 数据初始化

系统启动时会自动初始化：
1. 创建默认管理员账号（如果不存在）
2. 初始化数据库索引（需要在云开发控制台手动配置）

## 数据迁移

从SQLite迁移到云数据库时需要注意：
1. 字段类型映射（SQLite → JSON）
2. 时间戳格式保持一致
3. 关系数据通过ID关联而非外键

## 索引优化建议

为了提高查询性能，建议在云开发控制台配置以下索引：

1. **bookings集合**：
   - `userId`（单字段索引）
   - `bookingDate`（单字段索引）
   - `status`（单字段索引）
   - `bookingDate + bookingTimeSlot`（复合索引）

2. **users集合**：
   - `openId`（唯一索引）

3. **admins集合**：
   - `username`（唯一索引）

4. **feedbacks集合**：
   - `status`（单字段索引）
   - `userId`（单字段索引）

5. **collections集合**：
   - `userId + type + itemId`（复合唯一索引）

