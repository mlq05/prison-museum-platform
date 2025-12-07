/**
 * 预约首页 - 展示预约流程和快速入口
 */

import { getTodayBookingStatus, getBookingList } from '../../utils/api';
import { formatDate } from '../../utils/common';

Page({
  data: {
    // 用户信息
    userInfo: null as any,
    // 预约流程步骤
    steps: [
      { id: 1, title: '选择日期', desc: '选择参观日期和时段', icon: '/assets/icons/calendar.png' },
      { id: 2, title: '填写信息', desc: '填写身份信息和参观人数', icon: '/assets/icons/form.png' },
      { id: 3, title: '提交审核', desc: '等待审核通过', icon: '/assets/icons/check.png' },
      { id: 4, title: '参观体验', desc: '按时参观，体验AR功能', icon: '/assets/icons/visit.png' },
    ],
    // 我的预约（最近3条）
    myBookings: [] as any[],
    // 今日预约情况
    todayBooking: {
      totalSlots: 4,
      availableSlots: 2,
      isAvailable: true,
    },
  },

  onLoad() {
    console.log('预约页面加载');
    this.initPage();
  },

  onShow() {
    this.loadMyBookings();
  },

  /**
   * 初始化页面
   */
  async initPage() {
    // 先加载用户信息（不强制登录）
    await this.loadUserInfo();
    // 然后加载其他数据
    await Promise.all([
      this.loadTodayBooking(),
      this.loadMyBookings(),
    ]);
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const app = getApp<IAppOption>();
      const userInfo = await app.getUserInfo();
      if (userInfo) {
        this.setData({ userInfo });
      }
      // 未登录时不强制弹窗，允许用户浏览页面
      // 只有在需要操作时才提示登录
    } catch (e) {
      console.error('加载用户信息失败', e);
      // 静默失败，不影响页面展示
    }
  },

  /**
   * 加载今日预约情况
   */
  async loadTodayBooking() {
    try {
      const res = await getTodayBookingStatus();
      if (res.success && res.data) {
        this.setData({ todayBooking: res.data });
      } else {
        // 使用默认值
        this.setData({
          todayBooking: {
            totalSlots: 4,
            availableSlots: 0,
            isAvailable: false,
          },
        });
      }
    } catch (e: any) {
      console.error('加载今日预约情况失败', e);
      // 静默失败，使用默认值，不显示错误提示（API层已处理）
      this.setData({
        todayBooking: {
          totalSlots: 4,
          availableSlots: 0,
          isAvailable: false,
        },
      });
    }
  },

  /**
   * 加载我的预约
   */
  async loadMyBookings() {
    // 检查登录状态，未登录时不加载
    const app = getApp<IAppOption>();
    const userInfo = await app.getUserInfo();
    if (!userInfo) {
      this.setData({ myBookings: [] });
      return;
    }

    try {
      const res = await getBookingList({ page: 1, pageSize: 3 });
      if (res.success && res.data) {
        const statusMap: Record<string, string> = {
          pending: '待审核',
          approved: '已通过',
          rejected: '已驳回',
          cancelled: '已取消',
          completed: '已完成',
        };

        const myBookings = res.data.list.map((booking) => {
          const dateStr = booking.bookingDate || '';
          const parts = dateStr.split('-');
          const day = parts.length === 3 ? parseInt(parts[2], 10) || '' : '';

          return {
            id: (booking as any).id?.toString?.() || (booking as any)._id || '',
            date: booking.bookingDate,
            day,
            timeSlot: booking.bookingTimeSlot,
            status: booking.status,
            statusText: statusMap[booking.status] || '未知',
            visitorCount: booking.visitorCount,
          };
        });

        this.setData({ myBookings: myBookings.slice(0, 3) });
      } else {
        this.setData({ myBookings: [] });
      }
    } catch (e: any) {
      console.error('加载我的预约失败', e);
      // 如果是认证错误，清空列表但不显示错误（已在API层处理）
      if (e.message && e.message.includes('登录')) {
        this.setData({ myBookings: [] });
      } else {
        // 其他错误静默处理
        this.setData({ myBookings: [] });
      }
    }
  },

  /**
   * 跳转登录
   */
  goToLogin() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            const app = getApp<IAppOption>();
            await app.login();
            // 登录成功后刷新用户信息和预约列表
            await this.loadUserInfo();
            await this.loadMyBookings();
          } catch (e: any) {
            console.error('登录失败', e);
            wx.showToast({
              title: e.message || '登录失败，请重试',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 立即预约
   */
  async onStartBooking() {
    // 检查登录状态
    const app = getApp<IAppOption>();
    const userInfo = await app.getUserInfo();
    
    if (!userInfo) {
      // 需要登录时再提示
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: '/pages/booking-calendar/booking-calendar',
    });
  },

  /**
   * 查看我的预约
   */
  async onViewMyBookings() {
    // 检查登录状态
    const app = getApp<IAppOption>();
    const userInfo = await app.getUserInfo();
    
    if (!userInfo) {
      // 需要登录时再提示
      this.goToLogin();
      return;
    }

    wx.navigateTo({
      url: '/pages/booking-list/booking-list',
    });
  },

  /**
   * 点击预约记录
   */
  onBookingTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/booking-detail/booking-detail?id=${id}`,
    });
  },
});

