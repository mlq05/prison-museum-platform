/**
 * app.ts - 应用程序入口
 * 中国监狱历史文化展览馆智慧预约与文化传播平台
 */

import { UserInfo, UserRole } from './utils/types';

interface IAppOption {
  globalData: {
    userInfo: UserInfo | null;
    token: string | null;
    systemInfo: WechatMiniprogram.SystemInfo | null;
  };
  // 检查登录状态
  checkLogin: () => Promise<boolean>;
  // 获取用户信息
  getUserInfo: () => Promise<UserInfo | null>;
  // 登录
  login: () => Promise<void>;
  // 退出登录
  logout: () => void;
}

App<IAppOption>({
  globalData: {
    userInfo: null,
    token: null,
    systemInfo: null,
  },

  onLaunch() {
    console.log('小程序启动 - 监狱历史文化展览馆智慧预约平台');
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 初始化云开发环境
    this.initCloud();
    
    // 检查登录状态
    this.checkLogin();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(error: string) {
    console.error('小程序错误:', error);
    wx.showToast({
      title: '系统错误，请稍后重试',
      icon: 'none',
      duration: 2000,
    });
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      console.log('系统信息:', systemInfo);
      
      // 检查AR支持情况
      this.checkARSupport();
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },

  /**
   * 检查AR支持情况
   */
  checkARSupport() {
    const systemInfo = this.globalData.systemInfo;
    if (!systemInfo) return;

    const platform = systemInfo.platform;
    const system = systemInfo.system;

    // iOS版本检查
    if (platform === 'ios') {
      const version = parseFloat(system.split(' ')[1]);
      if (version < 12) {
        console.warn('iOS版本过低，AR功能可能无法正常使用');
      }
    }

    // Android版本检查
    if (platform === 'android') {
      const version = parseFloat(system);
      if (version < 8) {
        console.warn('Android版本过低，AR功能可能无法正常使用');
      }
    }
  },

  /**
   * 初始化云开发环境
   */
  initCloud() {
    if (!wx.cloud) {
      console.warn('当前基础库不支持云开发，将使用测试模式');
      return;
    }

    try {
      // ============================================
      // 云开发环境配置
      // ============================================
      // 方式1：指定云环境ID（推荐）
      // 在微信开发者工具中开通云开发后，获取环境ID并填入下方
      const cloudEnvId: string = ''; // 例如：'cloud1-xxx' 或 'test-xxx'
      
      // 方式2：使用默认环境（如果只有一个环境）
      // 将 cloudEnvId 留空即可使用默认环境
      // ============================================
      
      if (cloudEnvId && cloudEnvId.trim() !== '') {
        // 使用指定的云环境ID
        wx.cloud.init({
          env: cloudEnvId,
          traceUser: true,
        });
        console.log('云开发环境初始化完成，环境ID:', cloudEnvId);
      } else {
        // 使用默认环境（自动选择第一个可用环境）
        try {
          wx.cloud.init({
            traceUser: true,
          });
          console.log('云开发环境初始化完成（使用默认环境）');
        } catch (e) {
          console.warn('云开发环境未配置，将使用测试模式', e);
          console.warn('提示：请在微信开发者工具中开通云开发，或在此处配置 cloudEnvId');
        }
      }
    } catch (e) {
      console.warn('云开发初始化失败，将使用测试模式', e);
    }
  },

  /**
   * 检查登录状态
   */
  async checkLogin(): Promise<boolean> {
    try {
      const token = wx.getStorageSync('token');
      const userInfoStr = wx.getStorageSync('userInfo');

      if (token && userInfoStr) {
        this.globalData.token = token;
        this.globalData.userInfo = JSON.parse(userInfoStr);
        return true;
      }

      return false;
    } catch (e) {
      console.error('检查登录状态失败', e);
      return false;
    }
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<UserInfo | null> {
    if (this.globalData.userInfo) {
      return this.globalData.userInfo;
    }

    const isLoggedIn = await this.checkLogin();
    return isLoggedIn ? this.globalData.userInfo : null;
  },

  /**
   * 登录
   */
  async login(): Promise<void> {
    try {
      // 微信登录获取code
      const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      });

      if (!loginRes.code) {
        throw new Error('获取登录凭证失败');
      }

      // TODO: 将code发送到服务器换取openId和token
      // 这里暂时使用模拟数据
      const mockUserInfo: UserInfo = {
        openId: 'mock_open_id',
        role: UserRole.VISITOR,
        name: '',
        phone: '',
        verified: false,
        createdAt: Date.now(),
      };

      this.globalData.userInfo = mockUserInfo;
      this.globalData.token = 'mock_token';

      // 存储到本地
      wx.setStorageSync('token', 'mock_token');
      wx.setStorageSync('userInfo', JSON.stringify(mockUserInfo));
    } catch (e) {
      console.error('登录失败', e);
      throw e;
    }
  },

  /**
   * 退出登录
   */
  logout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    console.log('已退出登录');
  },
});
