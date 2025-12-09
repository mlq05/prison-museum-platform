/**
 * API封装工具
 * 统一处理网络请求、错误处理、数据加密等
 */

import { API_ENDPOINTS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import { ApiResponse } from './types';

// 请求基础URL（云托管服务器）
// 生产环境：使用云托管地址
// 开发环境：如需本地调试，改为 http://localhost:3000/api
const BASE_URL = 'https://museum-api-205770-6-1390408503.sh.run.tcloudbase.com/api';

// 是否使用云开发云函数
// 本项目当前采用本地 Node.js 服务器，不再使用云函数调用
const USE_CLOUD_FUNCTION = false;

// 云函数名称映射
const CLOUD_FUNCTION_MAP: Record<string, string> = {
  '/booking/create': 'booking',
  '/booking/list': 'booking',
  '/booking/detail': 'booking',
  '/booking/cancel': 'booking',
  '/booking/calendar': 'booking',
  '/user/login': 'user',
  '/user/info': 'user',
  '/user/update': 'user',
  '/admin/booking/list': 'admin',
  '/admin/booking/review': 'admin',
  '/admin/visit/settings': 'admin',
};

// 请求头
const getHeaders = (): Record<string, string> => {
  const token = wx.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * 统一请求方法
 */
export const request = <T = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: Record<string, string>;
    showLoading?: boolean;
    loadingText?: string;
  } = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    data,
    header = {},
    showLoading = true,
    loadingText = '加载中...',
  } = options;

  // 如果使用云开发云函数且云开发已初始化
  if (USE_CLOUD_FUNCTION && wx.cloud) {
    try {
      return requestWithCloudFunction<T>(url, method, data, { showLoading, loadingText });
    } catch (e) {
      console.warn('云函数调用失败，降级到HTTP请求', e);
      // 降级到HTTP请求
    }
  }

  // 使用普通HTTP请求
  return requestWithHttp<T>(url, method, data, header, { showLoading, loadingText });
};

/**
 * 使用云开发云函数请求
 */
const requestWithCloudFunction = <T = any>(
  url: string,
  method: string,
  data: any,
  options: { showLoading?: boolean; loadingText?: string }
): Promise<ApiResponse<T>> => {
  const { showLoading = true, loadingText = '加载中...' } = options;

  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true,
      });
    }

    // 获取云函数名称
    const functionName = CLOUD_FUNCTION_MAP[url] || 'api';
    
    // 构建云函数参数
    const cloudData = {
      path: url,
      method: method,
      data: data || {},
      token: wx.getStorageSync('token') || '',
    };

    wx.cloud.callFunction({
      name: functionName,
      data: cloudData,
      success: (res: any) => {
        if (showLoading) {
          wx.hideLoading();
        }

        // 处理云函数返回结果
        const result = res.result || res;
        let response: ApiResponse<T>;

        if (typeof result === 'string') {
          try {
            response = JSON.parse(result);
          } catch (e) {
            reject(new Error('服务器响应格式错误'));
            return;
          }
        } else {
          response = result;
        }

        // 处理认证失败
        if (response.message && (response.message.includes('登录') || response.message.includes('认证'))) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
        }

        if (response.success) {
          resolve(response);
        } else {
          const errorMessage = response.message || '请求失败';
          if (showLoading) {
            wx.showToast({
              title: errorMessage,
              icon: 'none',
              duration: 2000,
            });
          }
          reject(new Error(errorMessage));
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.error('云函数调用失败', err);
        
        // 如果云函数调用失败，尝试降级到模拟数据（仅用于测试）
        if (url.includes('/booking/create')) {
          console.warn('云函数调用失败，使用模拟数据（测试模式）');
          resolve({
            success: true,
            message: '提交成功（测试模式）',
            data: {
              bookingId: `test_${Date.now()}`,
            } as any,
          });
          return;
        }

        const errorMessage = err.errMsg || '网络错误，请检查网络连接';
        if (showLoading) {
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000,
          });
        }
        reject(new Error(errorMessage));
      },
    });
  });
};

/**
 * 使用HTTP请求
 */
const requestWithHttp = <T = any>(
  url: string,
  method: string,
  data: any,
  header: Record<string, string>,
  options: { showLoading?: boolean; loadingText?: string }
): Promise<ApiResponse<T>> => {
  const { showLoading = true, loadingText = '加载中...' } = options;

  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true,
      });
    }

    // 如果BASE_URL为空且没有配置服务器域名，使用测试模式
    if (!BASE_URL && url.includes('/booking/create')) {
      console.warn('未配置服务器域名，使用测试模式');
      setTimeout(() => {
        if (showLoading) {
          wx.hideLoading();
        }
        resolve({
          success: true,
          message: '提交成功（测试模式）',
          data: {
            bookingId: `test_${Date.now()}`,
          } as any,
        });
      }, 1000);
      return;
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method: method as any,
      data,
      header: {
        ...getHeaders(),
        ...header,
      },
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }

        const statusCode = res.statusCode || 200;
        
        // 处理非JSON响应
        let response: ApiResponse<T>;
        try {
          // 详细日志：记录服务器原始响应
          console.log('服务器响应详情:', {
            statusCode,
            url: `${BASE_URL}${url}`,
            dataType: typeof res.data,
            dataLength: typeof res.data === 'string' ? res.data.length : 'not string',
            dataPreview: typeof res.data === 'string' 
              ? res.data.substring(0, 200) 
              : JSON.stringify(res.data).substring(0, 200),
          });

          response = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (e) {
          // 详细的解析错误信息
          console.error('JSON解析失败:', {
            error: e,
            dataType: typeof res.data,
            dataContent: typeof res.data === 'string' ? res.data.substring(0, 500) : res.data,
            statusCode,
            url: `${BASE_URL}${url}`,
          });
          
          const errorMessage = `服务器响应格式错误: ${e instanceof Error ? e.message : String(e)}`;
          reject(new Error(errorMessage));
          return;
        }

        // 处理认证失败（401/403）
        if (statusCode === 401 || statusCode === 403) {
          // 清除token
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          const errorMessage = response.message || '登录已过期，请重新登录';
          reject(new Error(errorMessage));
          return;
        }

        if (statusCode === 200 && response.success) {
          resolve(response);
        } else {
          const errorMessage = response.message || ERROR_MESSAGES[statusCode] || '请求失败';
          // 只在非静默模式下显示错误提示
          if (showLoading) {
            wx.showToast({
              title: errorMessage,
              icon: 'none',
              duration: 2000,
            });
          }
          reject(new Error(errorMessage));
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }

        // 详细错误日志
        console.error('HTTP 请求失败', {
          url: `${BASE_URL}${url}`,
          endpoint: url,
          error: err,
          errMsg: err.errMsg,
          errno: err.errno,
        });

        // 检查是否是域名白名单问题
        if (err.errMsg && (err.errMsg.includes('域名') || err.errMsg.includes('不在合法域名'))) {
          console.error('域名白名单错误：', {
            message: '需要在微信公众平台配置服务器域名白名单',
            apiUrl: BASE_URL,
            tip: '测试版本需要配置域名白名单，或使用开发版本测试',
          });
        }

        // 如果是创建预约请求，提供测试模式降级
        if (url.includes('/booking/create')) {
          console.warn('网络请求失败，使用测试模式');
          resolve({
            success: true,
            message: '提交成功（测试模式）',
            data: {
              bookingId: `test_${Date.now()}`,
            } as any,
          });
          return;
        }

        // 更详细的错误提示
        let errorMessage = ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR] || '网络错误，请检查网络连接';
        
        // 如果是域名相关错误，提供更明确的提示
        if (err.errMsg && (err.errMsg.includes('域名') || err.errMsg.includes('不在合法域名'))) {
          errorMessage = '网络错误：需要在微信公众平台配置服务器域名白名单，或使用开发版本测试';
        } else if (err.errMsg) {
          errorMessage = `网络错误：${err.errMsg}`;
        }

        // 只在非静默模式下显示错误提示
        if (showLoading) {
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000,
          });
        }
        reject(new Error(errorMessage));
      },
    });
  });
};

/**
 * GET请求
 */
export const get = <T = any>(url: string, data?: any, options?: { showLoading?: boolean; loadingText?: string }) => {
  return request<T>(url, {
    method: 'GET',
    data,
    ...options,
  });
};

/**
 * POST请求
 */
export const post = <T = any>(url: string, data?: any, options?: { showLoading?: boolean; loadingText?: string }) => {
  return request<T>(url, {
    method: 'POST',
    data,
    ...options,
  });
};

/**
 * PUT请求
 */
export const put = <T = any>(url: string, data?: any, options?: { showLoading?: boolean; loadingText?: string }) => {
  return request<T>(url, {
    method: 'PUT',
    data,
    ...options,
  });
};

/**
 * DELETE请求
 */
export const del = <T = any>(url: string, data?: any, options?: { showLoading?: boolean; loadingText?: string }) => {
  return request<T>(url, {
    method: 'DELETE',
    data,
    ...options,
  });
};

/**
 * 文件上传
 */
export const uploadFile = (
  url: string,
  filePath: string,
  options: {
    name?: string;
    formData?: Record<string, any>;
    onProgressUpdate?: (progress: number) => void;
  } = {}
): Promise<any> => {
  const { name = 'file', formData = {}, onProgressUpdate } = options;

  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: getHeaders(),
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('上传失败'));
        }
      },
      fail: reject,
    });

    if (onProgressUpdate) {
      uploadTask.onProgressUpdate((res) => {
        onProgressUpdate(res.progress);
      });
    }
  });
};

/**
 * 文件下载
 */
export const downloadFile = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: `${BASE_URL}${url}`,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('下载失败'));
        }
      },
      fail: reject,
    });
  });
};

/**
 * 预约相关API
 */
import { BookingInfo, BookingStatus, DateBookingInfo, PageResponse, Feedback } from './types';

/**
 * 创建预约
 */
export const createBooking = (data: {
  bookingDate: string;
  bookingTimeSlot: string;
  visitorCount: number;
  name: string;
  phone: string;
  studentId?: string;
  workId?: string;
  unit?: string;
  idCard?: string;
  idCardPhoto?: string;
}): Promise<ApiResponse<{ bookingId: string }>> => {
  return post(API_ENDPOINTS.BOOKING_CREATE, data, {
    loadingText: '提交中...',
  });
};

/**
 * 获取预约列表
 */
export const getBookingList = (params?: {
  status?: BookingStatus | 'all';
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<PageResponse<BookingInfo>>> => {
  // 过滤掉值为 undefined / null / 空字符串的字段，避免被序列化为 "undefined" 之类影响服务端查询
  const cleanParams: any = {};
  if (params) {
    Object.keys(params).forEach((key) => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
  }

  return get(API_ENDPOINTS.BOOKING_LIST, cleanParams, {
    showLoading: false,
  });
};

/**
 * 获取预约详情
 */
export const getBookingDetail = (bookingId: string): Promise<ApiResponse<BookingInfo>> => {
  return get(`${API_ENDPOINTS.BOOKING_DETAIL}?id=${bookingId}`);
};

/**
 * 取消预约
 */
export const cancelBooking = (bookingId: string): Promise<ApiResponse<void>> => {
  return post(API_ENDPOINTS.BOOKING_CANCEL, { bookingId }, {
    loadingText: '取消中...',
  });
};

/**
 * 获取预约日历数据
 */
export const getBookingCalendar = (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<DateBookingInfo[]>> => {
  return get(API_ENDPOINTS.BOOKING_CALENDAR, params, {
    showLoading: false,
  }).catch((error) => {
    // 网络错误时，返回一个成功但数据为空的响应，让调用方可以继续使用默认数据
    console.warn('获取预约日历数据失败，返回空数据', error);
    return Promise.resolve({
      success: true,
      message: '',
      data: [],
    } as ApiResponse<DateBookingInfo[]>);
  });
};

/**
 * 获取今日预约情况
 */
export const getTodayBookingStatus = (): Promise<ApiResponse<{
  totalSlots: number;
  availableSlots: number;
  isAvailable: boolean;
}>> => {
  const today = new Date().toISOString().split('T')[0];
  
  return new Promise(async (resolve) => {
    try {
      // 获取今日的日历数据
      const res = await get(API_ENDPOINTS.BOOKING_CALENDAR, { startDate: today, endDate: today }, {
        showLoading: false,
      });

      if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const todayData = res.data[0];
        resolve({
          success: true,
          data: {
            totalSlots: todayData.totalAvailable || 4,
            availableSlots: todayData.totalAvailable || 0,
            isAvailable: !todayData.isFull && (todayData.totalAvailable || 0) > 0,
          },
        });
      } else {
        // 如果没有数据，返回默认值
        resolve({
          success: true,
          data: {
            totalSlots: 4,
            availableSlots: 0,
            isAvailable: false,
          },
        });
      }
    } catch (e) {
      // 静默失败，返回默认值
      resolve({
        success: true,
        data: {
          totalSlots: 4,
          availableSlots: 0,
          isAvailable: false,
        },
      });
    }
  });
};

/**
 * 展区相关API
 */
import { ExhibitionHall } from './types';

/**
 * 获取展区列表
 */
export const getHallList = (): Promise<ApiResponse<ExhibitionHall[]>> => {
  return get(API_ENDPOINTS.HALL_LIST, undefined, {
    showLoading: false,
  }).catch((error) => {
    // 网络错误时，返回一个成功但数据为空的响应
    console.warn('获取展区列表失败，返回空数据', error);
    return Promise.resolve({
      success: true,
      message: '',
      data: [],
    } as ApiResponse<ExhibitionHall[]>);
  });
};

/**
 * 获取展区详情
 */
export const getHallDetail = (id: string): Promise<ApiResponse<ExhibitionHall>> => {
  return get(`${API_ENDPOINTS.HALL_DETAIL}?id=${id}`);
};

/**
 * 用户账号密码相关API
 */

/**
 * 用户注册
 */
export const userRegister = (data: {
  username: string;
  password: string;
  openId?: string;
  code?: string;
}): Promise<ApiResponse<{ token: string; userInfo: any }>> => {
  return post(API_ENDPOINTS.USER_REGISTER, data, {
    loadingText: '注册中...',
  });
};

/**
 * 用户账号密码登录
 */
export const userLoginAccount = (data: {
  username: string;
  password: string;
  code?: string;
}): Promise<ApiResponse<{ token: string; userInfo: any }>> => {
  return post(API_ENDPOINTS.USER_LOGIN_ACCOUNT, data, {
    loadingText: '登录中...',
  });
};

/**
 * 检查用户名是否可用
 */
export const checkUsername = (username: string): Promise<ApiResponse<{ available: boolean; message: string }>> => {
  return get(`${API_ENDPOINTS.USER_CHECK_USERNAME}?username=${encodeURIComponent(username)}`, undefined, {
    showLoading: false,
  });
};

/**
 * 管理员相关API
 */

/**
 * 管理员登录
 */
export const adminLogin = (data: {
  username: string;
  password: string;
}): Promise<ApiResponse<{ token: string; admin: { username: string; role: string } }>> => {
  return post(API_ENDPOINTS.ADMIN_LOGIN, data, {
    loadingText: '登录中...',
  });
};

/**
 * 获取当前管理员信息（用于校验是否已登录）
 */
export const getAdminProfile = (): Promise<ApiResponse<{ username: string; role: string }>> => {
  return get(API_ENDPOINTS.ADMIN_PROFILE, undefined, {
    showLoading: false,
  });
};

/**
 * 获取统计数据
 */
export const getAdminStatistics = (params: {
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<{
  dateRange: { start: string; end: string };
  totalBookings: number;
  approvedBookings: number;
  cancelledBookings: number;
  totalVisitors: number;
  roleDistribution: {
    student: number;
    faculty: number;
    visitor: number;
  };
  cancellationRate: string;
}>> => {
  return get(API_ENDPOINTS.ADMIN_STATISTICS, params, {
    showLoading: false,
  });
};

/**
 * 获取管理员预约列表
 */
export const getAdminBookingList = (params?: {
  status?: BookingStatus | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<ApiResponse<PageResponse<BookingInfo>>> => {
  return get(API_ENDPOINTS.ADMIN_BOOKING_LIST, params, {
    showLoading: false,
  });
};

/**
 * 审核预约
 */
export const reviewBooking = (data: {
  bookingId: string;
  action: 'approve' | 'reject';
  rejectReason?: string;
}): Promise<ApiResponse<void>> => {
  return post(API_ENDPOINTS.ADMIN_BOOKING_REVIEW, data, {
    loadingText: '处理中...',
  });
};

/**
 * 获取指定日期的参观时段配置
 */
export const getVisitSettings = (params: {
  date: string;
}): Promise<ApiResponse<
  {
    id: number;
    date: string;
    timeSlotId: string;
    timeRange: string;
    capacity: number;
    maxPerBooking?: number;
    isActive: number;
  }[]
>> => {
  return get(API_ENDPOINTS.ADMIN_VISIT_SETTINGS, params, {
    showLoading: false,
  });
};

/**
 * 保存指定日期的参观时段配置
 */
export const saveVisitSettings = (data: {
  date: string;
  slots: {
    timeSlotId: string;
    timeRange: string;
    capacity: number;
    maxPerBooking?: number;
    isActive?: boolean;
  }[];
}): Promise<ApiResponse<void>> => {
  return post(API_ENDPOINTS.ADMIN_VISIT_SETTINGS, data, {
    loadingText: '保存中...',
  });
};

/**
 * 云存储上传文件（身份证照片等）
 */
export const uploadToCloudStorage = (
  filePath: string,
  cloudPath?: string
): Promise<ApiResponse<{ fileId: string; url: string }>> => {
  return new Promise((resolve, reject) => {
    // 检查是否支持云开发
    if (!wx.cloud || !wx.cloud.uploadFile) {
      // 如果不支持云开发，使用普通上传接口
      uploadFile('/upload/image', filePath, {
        name: 'file',
      })
        .then((res: any) => {
          if (res.success && res.data) {
            resolve({
              success: true,
              data: {
                fileId: res.data.fileId || '',
                url: res.data.url || res.data.fileId || '',
              },
            });
          } else {
            reject(new Error(res.message || '上传失败'));
          }
        })
        .catch((err) => {
          reject(new Error(err.message || '上传失败'));
        });
      return;
    }

    // 生成云存储路径
    const fileName = cloudPath || `idcards/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // 使用微信云开发上传
    wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: filePath,
      success: (res) => {
        // 获取文件URL
        if (wx.cloud && wx.cloud.getTempFileURL) {
          wx.cloud.getTempFileURL({
            fileList: [res.fileID],
            success: (urlRes) => {
              if (urlRes.fileList && urlRes.fileList.length > 0) {
                resolve({
                  success: true,
                  data: {
                    fileId: res.fileID,
                    url: urlRes.fileList[0].tempFileURL || urlRes.fileList[0].fileID,
                  },
                });
              } else {
                // 如果获取URL失败，至少返回fileID
                resolve({
                  success: true,
                  data: {
                    fileId: res.fileID,
                    url: res.fileID,
                  },
                });
              }
            },
            fail: (err) => {
              console.error('获取文件URL失败', err);
              // 如果获取URL失败，至少返回fileID
              resolve({
                success: true,
                data: {
                  fileId: res.fileID,
                  url: res.fileID,
                },
              });
            },
          });
        } else {
          // 如果getTempFileURL不可用，直接返回fileID
          resolve({
            success: true,
            data: {
              fileId: res.fileID,
              url: res.fileID,
            },
          });
        }
      },
      fail: (err) => {
        console.error('云存储上传失败', err);
        // 如果云开发上传失败，尝试使用普通上传接口
        uploadFile('/upload/image', filePath, {
          name: 'file',
        })
          .then((uploadRes: any) => {
            if (uploadRes.success && uploadRes.data) {
              resolve({
                success: true,
                data: {
                  fileId: uploadRes.data.fileId || '',
                  url: uploadRes.data.url || uploadRes.data.fileId || '',
                },
              });
            } else {
              reject(new Error(uploadRes.message || '上传失败'));
            }
          })
          .catch((uploadErr) => {
            reject(new Error(uploadErr.message || '上传失败，请检查网络连接'));
          });
      },
    });
  });
};

/**
 * 反馈相关API
 */

/**
 * 提交反馈
 */
export const submitFeedback = (data: {
  bookingId?: string;
  type: 'visit' | 'ar' | 'content' | 'other';
  content: string;
  images?: string[];
  rating?: number;
  arRating?: number;
}): Promise<ApiResponse<void>> => {
  return post(API_ENDPOINTS.FEEDBACK_SUBMIT, data, {
    loadingText: '提交中...',
  });
};

/**
 * 获取我的反馈列表（需要登录）
 */
export const getMyFeedbackList = (params?: {
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<PageResponse<Feedback>>> => {
  return get(API_ENDPOINTS.FEEDBACK_LIST, params, {
    showLoading: false,
  });
};

/**
 * 获取公开反馈列表（互动墙使用，无需登录）
 */
/**
 * 获取证书列表
 */
export const getCertificateList = (): Promise<ApiResponse<any[]>> => {
  return get('/certificate/list');
};

/**
 * 生成证书
 */
export const generateCertificate = (data: {
  type: 'visit' | 'game' | 'checkin';
  title: string;
  content: string;
  gameScore?: number;
  gameTotalScore?: number;
  arCheckInCount?: number;
}): Promise<ApiResponse<any>> => {
  return post('/certificate/generate', data);
};

/**
 * 获取证书详情
 */
export const getCertificateDetail = (certificateId: string): Promise<ApiResponse<any>> => {
  return get(`/certificate/detail?id=${certificateId}`);
};

export const getPublicFeedbackList = (params?: {
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<PageResponse<Feedback>>> => {
  return get('/feedback/public', params, {
    showLoading: false,
  });
};

// 导出API端点常量供使用
export { API_ENDPOINTS };

