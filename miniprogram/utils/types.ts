/**
 * 类型定义文件
 * 定义小程序中使用的所有TypeScript类型
 */

// 用户类型
export enum UserRole {
  STUDENT = 'student',           // 学生
  FACULTY = 'faculty',           // 教职工
  VISITOR = 'visitor',           // 校外访客
  ADMIN = 'admin'                // 管理员
}

// 用户信息
export interface UserInfo {
  openId: string;
  role: UserRole;
  studentId?: string;            // 学号
  workId?: string;               // 工号
  name: string;
  phone: string;
  avatarUrl?: string;
  unit?: string;                 // 单位（校外访客）
  idCard?: string;               // 身份证号
  idCardPhoto?: string;          // 身份证照片
  verified: boolean;             // 是否已审核
  createdAt: number;
}

// 预约状态
export enum BookingStatus {
  PENDING = 'pending',           // 待审核
  APPROVED = 'approved',         // 已通过
  REJECTED = 'rejected',         // 已驳回
  CANCELLED = 'cancelled',       // 已取消
  COMPLETED = 'completed'        // 已完成
}

// 预约信息
export interface BookingInfo {
  _id?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  phone: string;
  bookingDate: string;           // 预约日期 YYYY-MM-DD
  bookingTimeSlot: string;       // 时段 如 "09:00-11:00"
  visitorCount: number;          // 参观人数
  status: BookingStatus;
  remark?: string;               // 备注信息
  isLeaderVisit?: boolean;       // 领导来访标识
  rejectReason?: string;         // 驳回原因
  routeId?: string;              // 推荐路线ID
  arModelsPreloaded?: string[];  // 预加载的AR模型列表
  createdAt: number;
  updatedAt: number;
  reviewedBy?: string;           // 审核人
  reviewedAt?: number;           // 审核时间
}

// 时段信息
export interface TimeSlot {
  id: string;
  time: string;                  // "09:00-11:00"
  available: number;             // 剩余名额
  total: number;                 // 总名额
  isWarning: boolean;            // 是否预警（≤5人）
}

// 日期预约信息
export interface DateBookingInfo {
  date: string;                  // YYYY-MM-DD
  timeSlots: TimeSlot[];
  totalAvailable: number;
  isFull: boolean;
}

// 展区信息
export interface ExhibitionHall {
  _id?: string;
  name: string;
  description: string;
  coverImage: string;
  floor: number;                 // 楼层
  order: number;                 // 排序
  arMarkerImage?: string;        // AR marker图片
  arModelUrl?: string;           // AR模型URL
  arModelSize?: number;          // 模型大小（MB）
  audioGuideUrl?: string;        // 语音导览URL
  textGuide: string;             // 文字导览
  checkInPoints: string[];       // AR打卡点ID列表
  isActive: boolean;
  createdAt: number;
}

// AR打卡点
export interface ARCheckInPoint {
  id: string;
  hallId: string;
  name: string;
  markerImage: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  knowledgePoint?: KnowledgePoint;
}

// 知识点
export interface KnowledgePoint {
  id: string;
  title: string;
  content: string;
  images?: string[];
  relatedStory?: string;
  historicalBackground?: string;
  culturalValue?: string;
  hallId: string;
}

// AR模型信息
export interface ARModel {
  id: string;
  hallId: string;
  name: string;
  modelUrl: string;              // glb/gltf格式
  thumbnailUrl: string;
  fileSize: number;              // 字节
  animations?: string[];         // 动画列表
  interactiveElements?: {
    componentId: string;
    name: string;
    knowledgePointId: string;
  }[];
}

// 收藏信息
export interface Collection {
  _id?: string;
  userId: string;
  type: 'knowledge' | 'hall' | 'model';
  itemId: string;
  itemData: any;
  createdAt: number;
}

// 电子证书
export interface Certificate {
  _id?: string;
  userId: string;
  userName: string;
  type: 'visit' | 'game' | 'checkin';  // 参观、闯关、打卡
  title: string;
  content: string;
  arCheckInCount?: number;
  gameScore?: number;
  gameTotalScore?: number;
  issueDate: string;
  certificateNumber: string;
  imageUrl?: string;
  pdfUrl?: string;
}

// 知识闯关题目
export interface GameQuestion {
  id: string;
  type: 'single' | 'multiple' | 'fill';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  relatedHallId: string;
  relatedARModelId?: string;
  score: number;
  explanation: string;
}

// 闯关记录
export interface GameRecord {
  _id?: string;
  userId: string;
  userName: string;
  questions: {
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
  }[];
  totalScore: number;
  maxScore: number;
  passed: boolean;
  completedAt: number;
}

// 参观反馈
export interface Feedback {
  _id?: string;
  userId: string;
  userName: string;
  bookingId?: string;
  type: 'visit' | 'ar' | 'content' | 'other';
  content: string;
  images?: string[];
  rating: number;                // 1-5星
  arRating?: number;             // AR功能评分
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  adminComment?: string;
}

// 统计数据
export interface Statistics {
  dateRange: {
    start: string;
    end: string;
  };
  totalBookings: number;
  approvedBookings: number;
  cancelledBookings: number;
  totalVisitors: number;
  roleDistribution: {
    student: number;
    faculty: number;
    visitor: number;
  };
  arUsageCount: number;
  topARHalls: {
    hallId: string;
    hallName: string;
    count: number;
  }[];
  dailyBookings: {
    date: string;
    count: number;
  }[];
  cancellationRate: number;
}

// 异常预约预警
export interface AbnormalBooking {
  _id?: string;
  userId: string;
  reason: 'multiple_submit' | 'verify_failed' | 'fake_contact' | 'other';
  description: string;
  bookingId?: string;
  status: 'pending' | 'processed' | 'ignored';
  createdAt: number;
  processedBy?: string;
  processedAt?: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 路线推荐
export interface RecommendedRoute {
  id: string;
  name: string;
  description: string;
  duration: number;              // 预计时长（分钟）
  halls: string[];               // 展区ID列表
  arModels: string[];            // AR模型ID列表
  targetRole?: UserRole[];       // 目标角色
}

// 导航位置
export interface NavigationPosition {
  hallId: string;
  hallName: string;
  floor: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

