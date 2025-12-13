/**
 * 后台管理首页
 */
import { adminLogin, getAdminProfile } from '../../utils/api';

Page({
  data: {
    isAdmin: false,
    loading: false,
    username: '',
    password: '',
  },

  onLoad() {
    this.checkAdmin();
  },

  async checkAdmin() {
    this.setData({ loading: true });
    try {
      const res = await getAdminProfile();
      if (res.success && res.data && res.data.role === 'admin') {
        this.setData({ isAdmin: true });
      } else {
        this.setData({ isAdmin: false });
      }
    } catch (e) {
      this.setData({ isAdmin: false });
    } finally {
      this.setData({ loading: false });
    }
  },

  onUsernameInput(e: WechatMiniprogram.Input) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e: WechatMiniprogram.Input) {
    this.setData({ password: e.detail.value });
  },

  async onLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none',
      });
      return;
    }

    try {
      const res = await adminLogin({ username, password });
      if (res.success && res.data) {
        // 管理员使用与普通用户相同的 token 存储键，后端通过 role 区分
        wx.setStorageSync('token', res.data.token);
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        });
        this.setData({ isAdmin: true });
      } else {
        throw new Error(res.message || '登录失败');
      }
    } catch (e: any) {
      wx.showToast({
        title: e.message || '登录失败，请重试',
        icon: 'none',
      });
    }
  },

  onBookingManage() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin-booking/admin-booking',
    });
  },

  onStatistics() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin-statistics/admin-statistics',
    });
  },

  onAnnualReport() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin-annual-report/admin-annual-report',
    });
  },

  onHallManage() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/admin-halls/admin-halls',
    });
  },
});

