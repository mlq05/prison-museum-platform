/**
 * 数据统计页面
 */
import { getAdminStatistics } from '../../utils/api';
import { formatDate } from '../../utils/common';

Page({
  data: {
    loading: true,
    dateRange: {
      start: '',
      end: '',
    },
    statistics: {
      totalBookings: 0,
      approvedBookings: 0,
      cancelledBookings: 0,
      totalVisitors: 0,
      roleDistribution: {
        student: 0,
        faculty: 0,
        visitor: 0,
      },
      cancellationRate: '0.00',
    },
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 默认查询最近30天的数据
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);

    this.setData({
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(today),
      },
    });

    this.loadStatistics();
  },

  /**
   * 选择开始日期
   */
  onStartDateChange(e: WechatMiniprogram.DatePickerChange) {
    this.setData({
      'dateRange.start': e.detail.value,
    });
    this.loadStatistics();
  },

  /**
   * 选择结束日期
   */
  onEndDateChange(e: WechatMiniprogram.DatePickerChange) {
    this.setData({
      'dateRange.end': e.detail.value,
    });
    this.loadStatistics();
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    const { start, end } = this.data.dateRange;
    if (!start || !end) {
      return;
    }

    // 验证日期范围
    if (start > end) {
      wx.showToast({
        title: '开始日期不能大于结束日期',
        icon: 'none',
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await getAdminStatistics({
        startDate: start,
        endDate: end,
      });

      if (res.success && res.data) {
        this.setData({
          statistics: res.data,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      console.error('加载统计数据失败', e);
      wx.showToast({
        title: e.message || '加载失败，请重试',
        icon: 'none',
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadStatistics().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
});
