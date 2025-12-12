/**
 * 登录/注册页面
 */
import { userLoginAccount, userRegister, checkUsername } from '../../utils/api';

// 定义App类型接口
interface IAppOption {
  globalData: {
    userInfo: any;
    token: string | null;
    systemInfo: WechatMiniprogram.SystemInfo | null;
  };
}

const app = getApp<IAppOption>();

Page({
  data: {
    isRegister: false, // 是否显示注册表单
    loading: false,
    username: '',
    password: '',
    confirmPassword: '',
    usernameError: '',
    passwordError: '',
    confirmPasswordError: '',
    usernameChecked: false, // 用户名是否已检查过
    role: 'visitor', // 用户身份：student(学生)、faculty(教职工)、visitor(访客)
    roleIndex: 2, // 默认选择访客（索引2）
    roleOptions: ['学生', '教职工', '访客'],
    roleValues: ['student', 'faculty', 'visitor'],
  },

  onLoad(options: any) {
    // 可以通过参数决定显示登录还是注册
    if (options.mode === 'register') {
      this.setData({ isRegister: true });
    }
  },

  /**
   * 切换到登录
   */
  switchToLogin() {
    this.setData({
      isRegister: false,
      username: '',
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
      usernameChecked: false,
      role: 'visitor',
      roleIndex: 2,
    });
  },

  /**
   * 切换到注册
   */
  switchToRegister() {
    this.setData({
      isRegister: true,
      username: '',
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
      usernameChecked: false,
      role: 'visitor',
      roleIndex: 2,
    });
  },

  /**
   * 选择身份
   */
  onRoleChange(e: WechatMiniprogram.PickerChange) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedRole = this.data.roleValues[selectedIndex];
    this.setData({
      roleIndex: selectedIndex,
      role: selectedRole,
    });
  },

  /**
   * 用户名输入
   */
  onUsernameInput(e: WechatMiniprogram.Input) {
    const username = e.detail.value.trim();
    this.setData({
      username,
      usernameError: '',
      usernameChecked: false,
    });

    // 如果是注册模式，实时验证用户名格式
    if (this.data.isRegister) {
      this.validateUsername(username);
    }
  },

  /**
   * 密码输入
   */
  onPasswordInput(e: WechatMiniprogram.Input) {
    const password = e.detail.value;
    this.setData({
      password,
      passwordError: '',
      confirmPasswordError: '',
    });

    // 如果是注册模式，验证密码
    if (this.data.isRegister) {
      this.validatePassword(password);
      // 如果确认密码已填写，重新验证
      if (this.data.confirmPassword) {
        this.validateConfirmPassword(this.data.confirmPassword, password);
      }
    }
  },

  /**
   * 确认密码输入
   */
  onConfirmPasswordInput(e: WechatMiniprogram.Input) {
    const confirmPassword = e.detail.value;
    this.setData({
      confirmPassword,
      confirmPasswordError: '',
    });

    if (this.data.isRegister) {
      this.validateConfirmPassword(confirmPassword, this.data.password);
    }
  },

  /**
   * 验证用户名格式
   */
  validateUsername(username: string): boolean {
    if (!username) {
      this.setData({ usernameError: '' });
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      this.setData({
        usernameError: '用户名格式不正确（4-20个字符，只能包含字母、数字、下划线）',
      });
      return false;
    }

    this.setData({ usernameError: '' });
    return true;
  },

  /**
   * 验证密码
   */
  validatePassword(password: string): boolean {
    if (!password) {
      this.setData({ passwordError: '' });
      return false;
    }

    if (password.length < 6) {
      this.setData({ passwordError: '密码长度至少为6位' });
      return false;
    }

    this.setData({ passwordError: '' });
    return true;
  },

  /**
   * 验证确认密码
   */
  validateConfirmPassword(confirmPassword: string, password: string): boolean {
    if (!confirmPassword) {
      this.setData({ confirmPasswordError: '' });
      return false;
    }

    if (confirmPassword !== password) {
      this.setData({ confirmPasswordError: '两次输入的密码不一致' });
      return false;
    }

    this.setData({ confirmPasswordError: '' });
    return true;
  },

  /**
   * 检查用户名是否可用
   */
  async checkUsernameAvailable() {
    const { username } = this.data;
    
    if (!username || !this.validateUsername(username)) {
      return;
    }

    try {
      this.setData({ loading: true });
      const res = await checkUsername(username);
      
      if (res.success && res.data) {
        if (!res.data.available) {
          this.setData({
            usernameError: res.data.message || '用户名已存在',
            usernameChecked: false,
          });
        } else {
          this.setData({
            usernameError: '',
            usernameChecked: true,
          });
        }
      }
    } catch (e: any) {
      console.error('检查用户名失败:', e);
      // 检查失败不影响注册，继续流程
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 登录
   */
  async onLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none',
      });
      return;
    }

    try {
      this.setData({ loading: true });

      // 尝试获取微信登录code（可选）
      let code = '';
      try {
        const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
          wx.login({
            success: resolve,
            fail: reject,
          });
        });
        code = loginRes.code || '';
      } catch (e) {
        console.warn('获取微信登录code失败:', e);
      }

      const res = await userLoginAccount({
        username,
        password,
        code,
      });

      if (res.success && res.data) {
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', JSON.stringify(res.data.userInfo));

        // 更新全局用户信息
        app.globalData.token = res.data.token;
        app.globalData.userInfo = res.data.userInfo;

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        });

        // 返回上一页或跳转到我的页面
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            // 如果有上一页，返回上一页并刷新
            const prevPage = pages[pages.length - 2];
            if (prevPage && typeof prevPage.onShow === 'function') {
              prevPage.onShow();
            }
            wx.navigateBack();
          } else {
            // 如果没有上一页，跳转到我的页面
            wx.switchTab({
              url: '/pages/my/my',
            });
          }
        }, 1500);
      } else {
        throw new Error(res.message || '登录失败');
      }
    } catch (e: any) {
      console.error('登录失败:', e);
      wx.showToast({
        title: e.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 注册
   */
  async onRegister() {
    const { username, password, confirmPassword } = this.data;

    // 验证所有字段
    if (!this.validateUsername(username)) {
      wx.showToast({
        title: '请检查用户名格式',
        icon: 'none',
      });
      return;
    }

    if (!this.validatePassword(password)) {
      wx.showToast({
        title: '请检查密码格式',
        icon: 'none',
      });
      return;
    }

    if (!this.validateConfirmPassword(confirmPassword, password)) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
      });
      return;
    }

    // 再次检查用户名是否可用
    if (!this.data.usernameChecked) {
      await this.checkUsernameAvailable();
      if (this.data.usernameError || !this.data.usernameChecked) {
        wx.showToast({
          title: '请检查用户名是否可用',
          icon: 'none',
        });
        return;
      }
    }

    try {
      this.setData({ loading: true });

      // 尝试获取微信登录code（可选，用于绑定微信）
      let code = '';
      try {
        const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
          wx.login({
            success: resolve,
            fail: reject,
          });
        });
        code = loginRes.code || '';
      } catch (e) {
        console.warn('获取微信登录code失败:', e);
      }

      const res = await userRegister({
        username,
        password,
        role: this.data.role,
        code,
      });

      if (res.success && res.data) {
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', JSON.stringify(res.data.userInfo));

        // 更新全局用户信息
        app.globalData.token = res.data.token;
        app.globalData.userInfo = res.data.userInfo;

        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500,
        });

        // 返回上一页或跳转到我的页面
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            // 如果有上一页，返回上一页并刷新
            const prevPage = pages[pages.length - 2];
            if (prevPage && typeof prevPage.onShow === 'function') {
              prevPage.onShow();
            }
            wx.navigateBack();
          } else {
            // 如果没有上一页，跳转到我的页面
            wx.switchTab({
              url: '/pages/my/my',
            });
          }
        }, 1500);
      } else {
        throw new Error(res.message || '注册失败');
      }
    } catch (e: any) {
      console.error('注册失败:', e);
      wx.showToast({
        title: e.message || '注册失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 微信登录（暂时未实现，可以后续扩展）
   */
  onWechatLogin() {
    wx.showToast({
      title: '微信登录功能开发中',
      icon: 'none',
    });
    // TODO: 实现微信登录
  },
});

