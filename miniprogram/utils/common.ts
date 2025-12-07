/**
 * 通用工具函数
 * 包含数据格式化、脱敏、验证等常用方法
 */

import { DESENSITIZATION } from './constants';

/**
 * 格式化日期
 */
export const formatDate = (date: Date | string | number, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 获取日期范围
 */
export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(formatDate(date));
  }
  
  return dates;
};

/**
 * 手机号脱敏
 */
export const desensitizePhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  const start = phone.substring(0, DESENSITIZATION.PHONE_START);
  const end = phone.substring(phone.length - DESENSITIZATION.PHONE_END);
  const middle = '*'.repeat(phone.length - DESENSITIZATION.PHONE_START - DESENSITIZATION.PHONE_END);
  return `${start}${middle}${end}`;
};

/**
 * 身份证号脱敏
 */
export const desensitizeIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 18) return idCard;
  const start = idCard.substring(0, DESENSITIZATION.ID_CARD_START);
  const end = idCard.substring(idCard.length - DESENSITIZATION.ID_CARD_END);
  const middle = '*'.repeat(idCard.length - DESENSITIZATION.ID_CARD_START - DESENSITIZATION.ID_CARD_END);
  return `${start}${middle}${end}`;
};

/**
 * 验证手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneReg = /^1[3-9]\d{9}$/;
  return phoneReg.test(phone);
};

/**
 * 验证身份证号
 */
export const validateIdCard = (idCard: string): boolean => {
  const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardReg.test(idCard);
};

/**
 * 验证邮箱
 */
export const validateEmail = (email: string): boolean => {
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailReg.test(email);
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait) as any;
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * 获取URL参数
 */
export const getUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 检查是否为同一天
 */
export const isSameDay = (date1: Date | string | number, date2: Date | string | number): boolean => {
  const d1 = typeof date1 === 'string' || typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' || typeof date2 === 'number' ? new Date(date2) : date2;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * 获取相对时间
 */
export const getRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diff = now.getTime() - target.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
};

/**
 * 存储缓存
 */
export const setStorage = (key: string, value: any): void => {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error('存储失败', e);
  }
};

/**
 * 获取缓存
 */
export const getStorage = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    const value = wx.getStorageSync(key);
    return value ? JSON.parse(value) : defaultValue || null;
  } catch (e) {
    console.error('读取失败', e);
    return defaultValue || null;
  }
};

/**
 * 清除缓存
 */
export const removeStorage = (key: string): void => {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('清除失败', e);
  }
};

