/**
 * 常量定义文件
 * 定义小程序中使用的主要常量
 */

// 预约相关常量
export const BOOKING_CONFIG = {
  MAX_VISITOR_COUNT: 10,              // 最大参观人数
  MIN_ADVANCE_DAYS: 1,                // 最少提前预约天数
  MAX_ADVANCE_DAYS: 30,               // 最多提前预约天数
  WARNING_THRESHOLD: 5,               // 名额预警阈值
  AUTO_CANCEL_MINUTES: 10,            // 候补自动通知时间（分钟）
} as const;

// 时段配置
export const TIME_SLOTS = [
  { id: 'morning1', time: '09:00-11:00', label: '上午第一场' },
  { id: 'morning2', time: '11:00-13:00', label: '上午第二场' },
  { id: 'afternoon1', time: '14:00-16:00', label: '下午第一场' },
  { id: 'afternoon2', time: '16:00-18:00', label: '下午第二场' },
] as const;

// AR相关常量
export const AR_CONFIG = {
  MARKER_SIZE: 1,                     // marker尺寸（米）
  MODEL_MAX_SIZE: 5 * 1024 * 1024,   // 模型最大大小（5MB）
  LOAD_TIMEOUT: 10000,                // 加载超时时间（毫秒）
  CAMERA_DISTANCE: 0.5,               // 推荐摄像头距离（米）
  MIN_IOS_VERSION: 12,                // iOS最低版本
  MIN_ANDROID_VERSION: 8,             // Android最低版本
} as const;

// 知识闯关配置
export const GAME_CONFIG = {
  QUESTION_COUNT: 10,                 // 题目数量
  PASS_SCORE: 60,                     // 及格分数
  SINGLE_CHOICE_SCORE: 10,            // 单选题分值
  MULTIPLE_CHOICE_SCORE: 15,          // 多选题分值
  FILL_BLANK_SCORE: 10,               // 填空题分值
} as const;

// AR打卡配置
export const CHECKIN_CONFIG = {
  REQUIRED_POINTS: 3,                 // 需要打卡的点数
  CERTIFICATE_TITLE: '监狱历史文化传播大使',
} as const;

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,    // 图片最大大小（5MB）
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png'],
  MAX_AUDIO_SIZE: 10 * 1024 * 1024,   // 音频最大大小（10MB）
  ALLOWED_AUDIO_TYPES: ['mp3', 'm4a'],
} as const;

// 数据脱敏配置
export const DESENSITIZATION = {
  PHONE_START: 3,                     // 手机号保留前3位
  PHONE_END: 4,                       // 手机号保留后4位
  ID_CARD_START: 6,                   // 身份证保留前6位
  ID_CARD_END: 4,                     // 身份证保留后4位
} as const;

// 缓存Key
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  TOKEN: 'token',
  BOOKING_LIST: 'bookingList',
  AR_MODELS_CACHE: 'arModelsCache',
  GAME_RECORD: 'gameRecord',
  CHECKIN_POINTS: 'checkinPoints',
  COLLECTIONS: 'collections',
} as const;

// API端点
export const API_ENDPOINTS = {
  // 用户相关
  USER_LOGIN: '/user/login',
  USER_LOGIN_ACCOUNT: '/user/login-account',
  USER_REGISTER: '/user/register',
  USER_CHECK_USERNAME: '/user/check-username',
  USER_INFO: '/user/info',
  USER_UPDATE: '/user/update',

  // 管理员账号
  ADMIN_LOGIN: '/admin/login',
  ADMIN_PROFILE: '/admin/profile',
  
  // 预约相关
  BOOKING_CREATE: '/booking/create',
  BOOKING_LIST: '/booking/list',
  BOOKING_DETAIL: '/booking/detail',
  BOOKING_CANCEL: '/booking/cancel',
  BOOKING_CALENDAR: '/booking/calendar',
  
  // 展区相关
  HALL_LIST: '/hall/list',
  HALL_DETAIL: '/hall/detail',
  HALL_AR_MODELS: '/hall/ar-models',
  HALL_HOME_STATISTICS: '/hall/home-statistics',
  
  // AR相关
  AR_MODEL_DOWNLOAD: '/ar/model/download',
  AR_MARKER_GET: '/ar/marker/get',
  AR_CHECKIN: '/ar/checkin',
  
  // 收藏相关
  COLLECTION_ADD: '/collection/add',
  COLLECTION_LIST: '/collection/list',
  COLLECTION_REMOVE: '/collection/remove',
  AR_CLICK: '/ar/click',
  
  // 知识闯关
  GAME_START: '/game/start',
  GAME_SUBMIT: '/game/submit',
  
  // 证书
  CERTIFICATE_GENERATE: '/certificate/generate',
  CERTIFICATE_LIST: '/certificate/list',
  
  // 反馈
  FEEDBACK_SUBMIT: '/feedback/submit',
  FEEDBACK_LIST: '/feedback/list',
  FEEDBACK_PUBLIC: '/feedback/public',
  
  // 管理后台
  ADMIN_BOOKING_LIST: '/admin/booking/list',
  ADMIN_STATISTICS: '/admin/statistics',
  ADMIN_ANNUAL_REPORT: '/admin/annual-report',
  ADMIN_BOOKING_REVIEW: '/admin/booking/review',
  ADMIN_HALL_MANAGE: '/admin/hall/manage',
  ADMIN_VISIT_SETTINGS: '/admin/visit/settings',
} as const;

// 错误码
export const ERROR_CODES = {
  SUCCESS: 0,
  PARAM_ERROR: 1001,
  AUTH_ERROR: 1002,
  PERMISSION_DENIED: 1003,
  NOT_FOUND: 1004,
  SERVER_ERROR: 5000,
  NETWORK_ERROR: 5001,
} as const;

// 错误消息
export const ERROR_MESSAGES: Record<number, string> = {
  [ERROR_CODES.SUCCESS]: '操作成功',
  [ERROR_CODES.PARAM_ERROR]: '参数错误',
  [ERROR_CODES.AUTH_ERROR]: '认证失败',
  [ERROR_CODES.PERMISSION_DENIED]: '权限不足',
  [ERROR_CODES.NOT_FOUND]: '资源不存在',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误',
  [ERROR_CODES.NETWORK_ERROR]: '网络错误，请检查网络连接',
};

// 页面路径
export const PAGE_PATHS = {
  INDEX: '/pages/index/index',
  BOOKING: '/pages/booking/booking',
  BOOKING_CALENDAR: '/pages/booking-calendar/booking-calendar',
  BOOKING_FORM: '/pages/booking-form/booking-form',
  BOOKING_SUCCESS: '/pages/booking-success/booking-success',
  BOOKING_LIST: '/pages/booking-list/booking-list',
  AR_EXPERIENCE: '/pages/ar-experience/ar-experience',
  MY: '/pages/my/my',
  ADMIN: '/pages/admin/admin',
} as const;

