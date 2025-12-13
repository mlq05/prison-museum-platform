/**
 * 年度报告页面
 */
import { getAnnualReport } from '../../utils/api';

Page({
  data: {
    loading: true,
    selectedYear: '',
    reportData: null as any,
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

    // 默认选择当前年份
    const currentYear = new Date().getFullYear();
    this.setData({
      selectedYear: `${currentYear}`,
    });

    this.loadReport();
  },

  /**
   * 选择年份
   */
  onYearChange(e: WechatMiniprogram.DatePickerChange) {
    const year = e.detail.value.split('-')[0];
    this.setData({
      selectedYear: year,
    });
    this.loadReport();
  },

  /**
   * 加载年度报告
   */
  async loadReport() {
    const { selectedYear } = this.data;
    if (!selectedYear) {
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await getAnnualReport({
        year: parseInt(selectedYear),
      });

      if (res.success && res.data) {
        this.setData({
          reportData: res.data,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      console.error('加载年度报告失败', e);
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
    this.loadReport().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
});

