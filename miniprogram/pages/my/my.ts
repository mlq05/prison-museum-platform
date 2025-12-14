/**
 * 我的页面 - 个人信息、预约记录、收藏等
 */

const app = getApp<IAppOption>();

Page({
  data: {
    // 用户信息
    userInfo: null as any,
    // 是否已登录
    isLoggedIn: false,
    // 菜单列表
    menuItems: [
      {
        id: 'bookings',
        title: '我的预约',
        icon: '/assets/icons/booking.png',
        path: '/pages/booking-list/booking-list',
        badge: 0,
      },
      {
        id: 'collections',
        title: '我的收藏',
        icon: '/assets/icons/collect.png',
        path: '/pages/my-collections/my-collections',
      },
      {
        id: 'certificates',
        title: '我的证书',
        icon: '/assets/icons/certificate.png',
        path: '/pages/my-certificates/my-certificates',
      },
      {
        id: 'feedback',
        title: '参观反馈',
        icon: '/assets/icons/feedback.png',
        path: '/pages/feedback/feedback',
      },
      {
        id: 'admin',
        title: '管理员入口',
        icon: '/assets/icons/admin.png',
        path: '/pages/admin/admin',
      },
    ],
    // 统计数据
    statistics: {
      bookingCount: 0,
      collectionCount: 0,
      certificateCount: 0,
    },
  },

  onLoad() {
    console.log('我的页面加载');
  },

  onShow() {
    this.checkLogin();
    this.loadData();
  },

  /**
   * 检查登录状态
   */
  async checkLogin() {
    try {
      const isLoggedIn = await app.checkLogin();
      const userInfo = await app.getUserInfo();

      this.setData({
        isLoggedIn: isLoggedIn,
        userInfo: userInfo || null,
      });
    } catch (e) {
      // 登录检查失败，设为未登录状态
      this.setData({
        isLoggedIn: false,
        userInfo: null,
      });
    }
  },

  /**
   * 加载数据
   */
  async loadData() {
    if (!this.data.isLoggedIn) return;

    // 加载统计数据
    await this.loadStatistics();
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    try {
      const { getUserStatistics } = require('../../utils/api');
      const res = await getUserStatistics();
      if (res.success && res.data) {
        this.setData({
          'statistics.bookingCount': res.data.bookingCount || 0,
          'statistics.collectionCount': res.data.collectionCount || 0,
          'statistics.certificateCount': res.data.certificateCount || 0,
        });
      } else {
        // API失败时使用默认值
        this.setData({
          'statistics.bookingCount': 0,
          'statistics.collectionCount': 0,
          'statistics.certificateCount': 0,
        });
      }
    } catch (e) {
      console.error('加载统计数据失败:', e);
      // 错误时使用默认值
      this.setData({
        'statistics.bookingCount': 0,
        'statistics.collectionCount': 0,
        'statistics.certificateCount': 0,
      });
    }
  },

  /**
   * 加载预约数量（已废弃，使用loadStatistics）
   */
  async loadBookingCount() {
    // 已合并到loadStatistics
  },

  /**
   * 加载收藏数量（已废弃，使用loadStatistics）
   */
  async loadCollectionCount() {
    // 已合并到loadStatistics
  },

  /**
   * 加载证书数量（已废弃，使用loadStatistics）
   */
  async loadCertificateCount() {
    // 已合并到loadStatistics
  },

  /**
   * 跳转登录
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  /**
   * 点击菜单项
   */
  onMenuItemTap(e: WechatMiniprogram.TouchEvent) {
    const { path } = e.currentTarget.dataset;
    if (path) {
      wx.navigateTo({
        url: path,
      });
    }
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            isLoggedIn: false,
            userInfo: null,
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
          });
        }
      },
    });
  },

  /**
   * 编辑个人信息
   */
  onEditProfile() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }

    // TODO: 跳转编辑个人信息页面
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  },
});

