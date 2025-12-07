/**
 * 我的证书页面
 */
import { getCertificateList } from '../../utils/api';

Page({
  data: {
    certificates: [] as any[],
    loading: true,
    refreshing: false,
    scrollHeight: '550px',
  },
  
  onLoad() {
    this.initPage();
    this.loadCertificates();
  },

  onShow() {
    // 页面显示时刷新证书列表
    this.loadCertificates();
  },

  /**
   * 初始化页面
   */
  initPage() {
    const systemInfo = wx.getSystemInfoSync();
    const windowHeight = systemInfo.windowHeight;
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarBaseHeight = systemInfo.platform === 'android' ? 48 : 44;
    const navBarHeight = navBarBaseHeight + statusBarHeight;
    const tabBarBaseHeight = 50;
    const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0;
    const tabBarHeight = tabBarBaseHeight + safeAreaBottom;
    
    const scrollHeight = windowHeight - navBarHeight - tabBarHeight;
    
    this.setData({
      scrollHeight: scrollHeight + 'px',
    });
  },

  /**
   * 加载证书列表
   */
  async loadCertificates() {
    this.setData({ loading: true });
    
    try {
      const res = await getCertificateList();
      if (res.success && res.data) {
        this.setData({
          certificates: res.data,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (error) {
      console.error('加载证书列表失败', error);
      this.setData({
        certificates: [],
        loading: false,
      });
    }
  },

  /**
   * 点击证书卡片
   */
  onCertificateTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/certificate/certificate?id=${id}`,
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadCertificates();
    setTimeout(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }, 1000);
  },
});

