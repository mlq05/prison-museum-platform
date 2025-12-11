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
        icon: '/assets/icons/tab-booking.png',
        path: '/pages/booking-list/booking-list',
        badge: 0,
      },
      {
        id: 'collections',
        title: '我的收藏',
        icon: '/assets/icons/tab-my.png',
        path: '/pages/my-collections/my-collections',
      },
      {
        id: 'certificates',
        title: '我的证书',
        icon: '/assets/icons/tab-home.png',
        path: '/pages/my-certificates/my-certificates',
      },
      {
        id: 'feedback',
        title: '参观反馈',
        icon: '/assets/icons/tab-ar.png',
        path: '/pages/feedback/feedback',
      },
      {
        id: 'admin',
        title: '管理员入口',
        icon: '/assets/icons/tab-my.png',
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
    await Promise.all([
      this.loadBookingCount(),
      this.loadCollectionCount(),
      this.loadCertificateCount(),
    ]);
  },

  /**
   * 加载预约数量
   */
  async loadBookingCount() {
    try {
      const { getBookingList } = require('../../utils/api');
      const res = await getBookingList({ status: 'all', page: 1, pageSize: 1 });
      if (res.success && res.data) {
        const total = res.data.total || 0;
        // 统计待审核的预约数量
        const pendingRes = await getBookingList({ status: 'pending', page: 1, pageSize: 1 });
        const pendingCount = pendingRes.success && pendingRes.data ? (pendingRes.data.total || 0) : 0;
        
        this.setData({
          'statistics.bookingCount': total,
          'menuItems[0].badge': pendingCount,
        });
      }
    } catch (e) {
      console.error('加载预约数量失败:', e);
      this.setData({
        'statistics.bookingCount': 0,
        'menuItems[0].badge': 0,
      });
    }
  },

  /**
   * 加载收藏数量
   */
  async loadCollectionCount() {
    try {
      const { get } = require('../../utils/api');
      const { API_ENDPOINTS } = require('../../utils/constants');
      const res = await get(API_ENDPOINTS.COLLECTION_LIST, undefined, { showLoading: false });
      if (res.success && res.data) {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        this.setData({
          'statistics.collectionCount': count,
        });
      }
    } catch (e) {
      console.error('加载收藏数量失败:', e);
      this.setData({
        'statistics.collectionCount': 0,
      });
    }
  },

  /**
   * 加载证书数量
   */
  async loadCertificateCount() {
    try {
      const { getCertificateList } = require('../../utils/api');
      const res = await getCertificateList();
      if (res.success && res.data) {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        this.setData({
          'statistics.certificateCount': count,
        });
      }
    } catch (e) {
      console.error('加载证书数量失败:', e);
      this.setData({
        'statistics.certificateCount': 0,
      });
    }
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

  /**
   * 点击统计数据
   */
  onStatTap(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset;
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }

    const menuItem = this.data.menuItems.find(item => item.id === type);
    if (menuItem && menuItem.path) {
      wx.navigateTo({
        url: menuItem.path,
      });
    }
  },
});

