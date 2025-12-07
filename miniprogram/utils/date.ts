/**
 * 日期工具函数
 */

import { formatDate } from './common';

/**
 * 获取星期几
 */
export const getWeekday = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekdays[d.getDay()];
};

/**
 * 获取日期数字（几号）
 */
export const getDateDay = (date: string | Date): number => {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.getDate();
};

/**
 * 判断是否为今天
 */
export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};

/**
 * 判断是否为周末
 */
export const isWeekend = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = d.getDay();
  return day === 0 || day === 6;
};

