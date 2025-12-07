/**
 * AR体验页面 - 核心创新功能
 * 使用web-view嵌入A-frame+AR.js实现的AR页面
 */

Page({
  data: {
    // 展区列表（支持AR的）
    arHalls: [] as any[],
    // AR使用指南
    guideSteps: [
      { id: 1, title: '扫描二维码', desc: '找到展区的AR二维码标识', icon: '/assets/icons/qrcode.png' },
      { id: 2, title: '对准识别', desc: '将摄像头对准二维码，保持30-50cm距离', icon: '/assets/icons/camera.png' },
      { id: 3, title: '互动探索', desc: '点击3D模型查看知识点，听语音解说', icon: '/assets/icons/interact.png' },
      { id: 4, title: 'AR打卡', desc: '完成打卡任务，解锁专属勋章', icon: '/assets/icons/checkin.png' },
    ],
    // 当前AR页面URL
    currentARUrl: '',
    // 是否显示AR页面
    showARView: false,
    // AR页面加载状态
    arLoading: false,
    // AR页面错误信息
    arError: '',
    // AR页面加载超时定时器
    arLoadTimer: null as any,
    // 是否首次使用
    isFirstTime: true,
    // 打卡进度
    checkInProgress: {
      current: 0,
      total: 3,
      points: [] as any[],
    },
    // 板块图片（占位符，后续替换）
    sectionImages: {
      section1: '', // 欢迎引导图片
      section2: '', // AR展区图片
      section3: '', // 打卡进度图片
      section4: '', // 使用指南图片
      section5: '', // 功能特色图片
      section6: '', // 常见问题图片
      section7: '', // 温馨提示图片
      section8: '', // 相关推荐图片
    },
  },

  onLoad(options: { hallId?: string }) {
    console.log('AR体验页面加载', options);
    this.checkFirstTime();
    this.loadARHalls();
    
    // 如果传入了hallId，直接开始AR体验（优先使用云开发AR方案）
    if (options.hallId) {
      this.startARExperience(options.hallId);
    }
  },

  onShow() {
    // 检查打卡进度
    this.loadCheckInProgress();
  },

  /**
   * 检查是否首次使用
   */
  checkFirstTime() {
    const hasUsed = wx.getStorageSync('ar_has_used');
    this.setData({ isFirstTime: !hasUsed });
  },

  /**
   * 加载AR展区列表
   */
  async loadARHalls() {
    // 使用与首页一致的展馆数据，只显示支持AR的展区
    const arHalls = [
      {
        id: '1',
        name: '古代监狱',
        description: '探索中国古代监狱制度的起源与发展，了解监狱名称沿革、治理思想、管理制度等',
        coverImage: '/assets/images/halls/ancient-prison.jpg',
        bgColor: '#8B4513',
        markerImage: '/assets/markers/hall1-marker.png',
        arModelUrl: '/assets/models/hall1-model.glb',
        checkInPointId: 'point1',
      },
      {
        id: '2',
        name: '近代狱制改良',
        description: '了解清末至民国时期监狱制度的系统性变革，从传统狱制向现代狱制的转型',
        coverImage: '/assets/images/halls/modern-reform.jpg',
        bgColor: '#4169E1',
        markerImage: '/assets/markers/hall2-marker.png',
        arModelUrl: '/assets/models/hall2-model.glb',
        checkInPointId: 'point2',
      },
      {
        id: '3',
        name: '革命根据地时期的监狱',
        description: '了解中国共产党领导下的革命根据地民主政权及其新型司法体制的创立',
        coverImage: '/assets/images/halls/revolutionary-base.jpg',
        bgColor: '#DC143C',
        markerImage: '/assets/markers/hall3-marker.png',
        arModelUrl: '/assets/models/hall3-model.glb',
        checkInPointId: 'point3',
      },
      {
        id: '4',
        name: '新中国劳改工作的开创与发展',
        description: '了解新中国成立后彻底废除旧监狱制度，形成具有中国特色的社会主义劳改制度',
        coverImage: '/assets/images/halls/new-china-labor.jpg',
        bgColor: '#FF6347',
        markerImage: '/assets/markers/hall4-marker.png',
        arModelUrl: '/assets/models/hall4-model.glb',
        checkInPointId: 'point4',
      },
      {
        id: '5',
        name: '改革开放与社会主义建设时期劳改工作的创新',
        description: '了解改革开放时期监狱系统的全面转型，包括"三分工作"、规范化管理等创新举措',
        coverImage: '/assets/images/halls/reform-opening.jpg',
        bgColor: '#32CD32',
        markerImage: '/assets/markers/hall5-marker.png',
        arModelUrl: '/assets/models/hall5-model.glb',
        checkInPointId: 'point5',
      },
      {
        id: '7',
        name: '新时代中国监狱的历史性变革',
        description: '了解新时代中国监狱在总体国家安全观和治本安全观指导下的历史性变革',
        coverImage: '/assets/images/halls/new-era-transformation.jpg',
        bgColor: '#FFD700',
        markerImage: '/assets/markers/hall7-marker.png',
        arModelUrl: '/assets/models/hall7-model.glb',
        checkInPointId: 'point7',
      },
    ];
    this.setData({ arHalls });
  },

  /**
   * 加载打卡进度
   */
  loadCheckInProgress() {
    const checkInPoints = wx.getStorageSync('ar_checkin_points') || [];
    this.setData({
      'checkInProgress.current': checkInPoints.length,
      'checkInProgress.points': checkInPoints,
    });
  },

  /**
   * 开始AR体验
   * 优先使用xr-frame（支持Hiro marker和3D模型），如果不可用则使用原生AR
   */
  startARExperience(hallId: string) {
    // 检查摄像头是否可用
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          // 已授权，根据运行环境选择 AR 方案
          try {
            const systemInfo = wx.getSystemInfoSync();
            const platform = systemInfo.platform;

            // 在开发者工具中，优先使用原生 AR，避免 xr-frame 组件在模拟器中的兼容问题
            if (platform === 'devtools') {
              console.log('开发者工具环境，使用原生 AR 方案（二维码识别）');
              this.openNativeAR(hallId);
              return;
            }
          } catch (e) {
            console.warn('获取系统信息失败，按正常流程选择 AR 方案', e);
          }

          // 真机环境：优先使用云开发AR方案（支持Hiro marker和3D模型，个人主体可用）
          // 如果云开发不可用，降级到原生AR
          if (this.checkCloudSupport()) {
            this.openCloudAR(hallId);
          } else {
            console.log('云开发不可用，使用原生 AR 方案');
            this.openNativeAR(hallId);
          }
          
          // 如果将来 xr-frame 可用，可以取消下面的注释
          // if (this.checkXRFrameSupport()) {
          //   this.openXRAR(hallId);
          // } else {
          //   console.log('基础库版本不足或xr-frame不可用，使用原生 AR 方案');
          //   this.openNativeAR(hallId);
          // }
        } else {
          // 未授权，请求权限
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('小程序摄像头权限授权成功');
              try {
                const systemInfo = wx.getSystemInfoSync();
                const platform = systemInfo.platform;

              if (platform === 'devtools') {
                console.log('开发者工具环境（授权后），使用原生 AR 方案');
                this.openNativeAR(hallId);
                return;
              }
            } catch (e) {
              console.warn('获取系统信息失败，按正常流程选择 AR 方案', e);
            }

            // 真机环境：优先使用云开发AR方案（支持Hiro marker和3D模型，个人主体可用）
            if (this.checkCloudSupport()) {
              this.openCloudAR(hallId);
            } else {
              console.log('云开发不可用，使用原生 AR 方案');
              this.openNativeAR(hallId);
            }
            },
            fail: () => {
              wx.showModal({
                title: '需要摄像头权限',
                content: 'AR功能需要使用摄像头识别marker，请在设置中开启摄像头权限',
                confirmText: '去设置',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          // 优先使用云开发AR方案
                          if (this.checkCloudSupport()) {
                            this.openCloudAR(hallId);
                          } else {
                            console.log('云开发不可用，使用原生 AR 方案');
                            this.openNativeAR(hallId);
                          }
                        }
                      },
                    });
                  }
                },
              });
            },
          });
        }
      },
      fail: () => {
        // 如果获取设置失败，尝试打开 xr-frame AR 页面
        if (this.checkXRFrameSupport()) {
          this.openXRAR(hallId);
        } else {
          this.openNativeAR(hallId);
        }
      },
    });
    
    /* 
    // 原始代码：支持 xr-frame（需要先下载组件）
    // 检查摄像头是否可用
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          // 已授权，优先尝试xr-frame AR
          if (this.checkXRFrameSupport()) {
            this.openXRAR(hallId);
          } else {
            this.openNativeAR(hallId);
          }
        } else {
          // 未授权，请求权限
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('小程序摄像头权限授权成功');
              if (this.checkXRFrameSupport()) {
                this.openXRAR(hallId);
              } else {
                this.openNativeAR(hallId);
              }
            },
            fail: () => {
              wx.showModal({
                title: '需要摄像头权限',
                content: 'AR功能需要使用摄像头识别marker，请在设置中开启摄像头权限',
                confirmText: '去设置',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          // 优先使用云开发AR方案
                          if (this.checkCloudSupport()) {
                            this.openCloudAR(hallId);
                          } else {
                            console.log('云开发不可用，使用原生 AR 方案');
                            this.openNativeAR(hallId);
                          }
                        }
                      },
                    });
                  }
                },
              });
            },
          });
        }
      },
      fail: () => {
        // 如果获取设置失败，直接尝试打开xr-frame AR页面
        if (this.checkXRFrameSupport()) {
          this.openXRAR(hallId);
        } else {
          this.openNativeAR(hallId);
        }
      },
    });
    */
  },

  /**
   * 打开xr-frame AR页面（支持Hiro marker识别和3D模型显示）
   */
  openXRAR(hallId: string) {
    console.log('打开xr-frame AR页面，hallId:', hallId);
    
    // 检查基础库版本
    const systemInfo = wx.getSystemInfoSync();
    const SDKVersion = systemInfo.SDKVersion || '';
    const version = SDKVersion.split('.').map(Number);
    
    // 需要基础库 >= 2.27.1
    let canUseXR = false;
    if (version.length >= 2) {
      const major = version[0];
      const minor = version[1];
      const patch = version[2] || 0;
      
      if (major > 2 || (major === 2 && minor > 27) || (major === 2 && minor === 27 && patch >= 1)) {
        canUseXR = true;
      }
    }
    
    if (!canUseXR) {
      wx.showModal({
        title: '版本要求',
        content: `xr-frame需要基础库≥2.27.1\n\n当前版本：${SDKVersion}\n\n请在微信开发者工具中升级基础库版本，或使用原生AR方案。`,
        confirmText: '使用原生AR',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.openNativeAR(hallId);
          }
        },
      });
      return;
    }
    
    // 标记已使用过AR功能
    wx.setStorageSync('ar_has_used', true);
    this.setData({ isFirstTime: false });

    // 尝试从当前AR展区列表中获取对应展区的3D模型URL
    let modelUrl = '';
    try {
      const halls = this.data.arHalls as any[];
      const hall = halls.find((h) => h.id === hallId);
      if (hall && hall.arModelUrl) {
        modelUrl = hall.arModelUrl;
      }
    } catch (e) {
      console.warn('获取AR展区模型URL失败，将使用默认几何体', e);
    }

    const queryModel = modelUrl ? `&modelUrl=${encodeURIComponent(modelUrl)}` : '';

    // 跳转到xr-frame AR页面
    wx.navigateTo({
      url: `/pages/ar-xr/ar-xr?hallId=${hallId}${queryModel}`,
      fail: (err) => {
        console.error('xr-frame AR页面跳转失败:', err);
        // 如果跳转失败（可能是组件找不到），自动降级到原生AR
        console.log('自动降级到原生AR方案');
        wx.showModal({
          title: 'xr-frame不可用',
          content: 'xr-frame组件未找到或配置错误，将使用原生AR方案（二维码识别）。\n\n如需使用Hiro marker和3D模型：\n1. 检查基础库版本≥2.27.1\n2. 或下载xr-frame组件\n3. 查看文档：docs/xr-frame问题快速解决指南.md',
          showCancel: true,
          confirmText: '使用原生AR',
          cancelText: '查看解决方案',
          success: (res) => {
            if (res.confirm) {
              this.openNativeAR(hallId);
            } else {
              // 显示解决方案
              wx.showModal({
                title: '解决方案',
                content: '请查看文档：docs/xr-frame问题快速解决指南.md\n\n或检查：\n1. 基础库版本≥2.27.1\n2. 微信开发者工具设置\n3. 清除缓存后重新编译',
                showCancel: false,
                confirmText: '知道了',
              });
            }
          },
        });
      },
      success: () => {
        console.log('成功跳转到xr-frame AR页面');
      },
    });
  },

  /**
   * 检查是否支持 xr-frame
   */
  checkXRFrameSupport(): boolean {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const SDKVersion = systemInfo.SDKVersion || '';
      const version = SDKVersion.split('.').map(Number);
      
      // 需要基础库 >= 2.27.1
      if (version.length >= 3) {
        const major = version[0];
        const minor = version[1];
        const patch = version[2] || 0;
        
        if (major > 2 || (major === 2 && minor > 27) || (major === 2 && minor === 27 && patch >= 1)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('检查xr-frame支持失败:', error);
      return false;
    }
  },

  /**
   * 检查云开发支持
   */
  checkCloudSupport(): boolean {
    try {
      // 检查是否已初始化云开发
      if (!wx.cloud) {
        return false;
      }
      
      // 检查云函数是否可用（可选）
      // 这里简单检查，实际使用时可以调用一个测试云函数
      return true;
    } catch (e) {
      console.warn('检查云开发支持失败', e);
      return false;
    }
  },

  /**
   * 打开云开发AR页面（支持Hiro marker和3D模型，个人主体可用）
   * 通过外部浏览器打开AR页面
   */
  openCloudAR(hallId: string) {
    console.log('打开云开发AR页面，hallId:', hallId);
    
    // 标记已使用过AR功能
    wx.setStorageSync('ar_has_used', true);
    this.setData({ isFirstTime: false });

    // 跳转到AR链接页面
    wx.navigateTo({
      url: `/pages/ar-link/ar-link?hallId=${hallId}`,
      fail: (err) => {
        console.error('AR链接页面跳转失败:', err);
        // 如果跳转失败，降级到原生AR
        wx.showModal({
          title: 'AR链接页面不可用',
          content: '无法打开AR链接页面，将使用原生AR方案（二维码识别）。',
          showCancel: false,
          confirmText: '确定',
          success: () => {
            this.openNativeAR(hallId);
          },
        });
      },
    });
  },

  /**
   * 打开本地原生AR页面（二维码识别，不支持3D模型）
   */
  openNativeAR(hallId: string) {
    console.log('打开本地原生AR页面，hallId:', hallId);
    
    // 标记已使用过AR功能
    wx.setStorageSync('ar_has_used', true);
    this.setData({ isFirstTime: false });

    // 跳转到本地AR页面
    wx.navigateTo({
      url: `/pages/ar-native/ar-native?hallId=${hallId}`,
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
        });
      },
    });
  },

  /**
   * 打开AR视图（web-view方式，仅企业主体可用）
   * @deprecated 个人主体无法使用，已改用openNativeAR
   */
  openARView(_hallId: string) {
    // 个人主体无法使用web-view，此方法已废弃
    wx.showModal({
      title: '功能受限',
      content: '个人主体小程序无法使用web-view功能，请使用本地AR体验。',
      showCancel: false,
    });
  },

  /**
   * 检查业务域名配置（已废弃，个人主体无法使用）
   */
  checkBusinessDomain(url: string): { valid: boolean; domain: string; message: string } {
    try {
      // 手动解析URL（兼容小程序环境）
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return {
          valid: false,
          domain: '',
          message: 'URL必须以http://或https://开头'
        };
      }
      
      const protocol = url.startsWith('https://') ? 'https:' : 'http:';
      
      // 提取域名部分
      let domain = '';
      const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
      const match = urlWithoutProtocol.match(/^([^\/\?:]+)/);
      if (match) {
        domain = match[1];
      } else {
        return {
          valid: false,
          domain: '',
          message: 'URL格式不正确，无法解析域名'
        };
      }
      
      // 检查是否是HTTPS
      if (protocol !== 'https:') {
        return {
          valid: false,
          domain: domain,
          message: 'web-view只支持HTTPS协议，请使用https://开头的URL'
        };
      }
      
      // 检查是否是本地地址或localhost
      if (domain === 'localhost' || domain.startsWith('127.') || domain.startsWith('192.168.') || domain.includes('localhost')) {
        return {
          valid: false,
          domain: domain,
          message: 'web-view不支持本地地址，请使用公网HTTPS域名'
        };
      }
      
      return {
        valid: true,
        domain: domain,
        message: `域名: ${domain}\n请确保已在微信公众平台配置业务域名白名单`
      };
    } catch (e) {
      return {
        valid: false,
        domain: '',
        message: 'URL格式不正确'
      };
    }
  },

  /**
   * 显示业务域名配置指南
   */
  showDomainConfigGuide(domain: string) {
    wx.showModal({
      title: '业务域名配置指南',
      content: `检测到域名: ${domain}\n\n⚠️ 小程序web-view必须配置业务域名才能正常显示！\n\n配置步骤：\n1. 登录微信公众平台\n   https://mp.weixin.qq.com\n2. 进入"开发" → "开发管理" → "开发设置"\n3. 找到"业务域名"，点击"添加"\n4. 输入域名: ${domain}\n5. 下载验证文件，上传到服务器根目录\n6. 点击"验证"完成配置\n\n💡 提示：验证文件必须能通过\n   https://${domain}/MP_verify_xxxxx.txt\n   访问到`,
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  /**
   * 关闭AR视图（已废弃，用于web-view）
   */
  closeARView() {
    // 清除超时定时器
    if (this.data.arLoadTimer) {
      clearTimeout(this.data.arLoadTimer);
    }
    this.setData({
      showARView: false,
      currentARUrl: '',
      arLoading: false,
      arError: '',
      arLoadTimer: null,
    });
  },

  /**
   * AR页面加载成功
   */
  onARViewLoad(e: WechatMiniprogram.WebviewLoad) {
    console.log('✅ AR页面web-view容器加载成功', e.detail);
    console.log('web-view URL:', e.detail.src);
    
    // 注意：这里只是web-view容器加载成功，AR.js等资源可能还在加载
    // 真正的AR加载完成会通过postMessage通知
    // 不立即隐藏加载提示，等待资源加载完成通知
    
    // 清除阶段1的定时器（10秒检测），因为web-view已经加载
    // 注意：如果10秒后web-view仍然是空白页，可能是业务域名未配置
    
    wx.showToast({
      title: '页面已加载，正在初始化AR...',
      icon: 'loading',
      duration: 2000,
    });
  },

  /**
   * AR页面加载失败
   */
  onARViewError(e: WechatMiniprogram.WebviewError) {
    console.error('❌ AR页面加载失败', e.detail);
    
    // 提取域名（手动解析，兼容小程序环境）
    let domain = '';
    try {
      const url = this.data.currentARUrl;
      if (url) {
        const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
        const match = urlWithoutProtocol.match(/^([^\/\?:]+)/);
        if (match) {
          domain = match[1];
        }
      }
    } catch (err) {
      console.error('无法解析URL', err);
    }
    
    const errorMsg = `无法加载AR页面`;
    this.setData({
      arLoading: false,
      arError: errorMsg,
    });
    
    wx.showModal({
      title: 'AR页面加载失败',
      content: `⚠️ 最常见原因：业务域名未配置！\n\n当前域名: ${domain}\nURL: ${this.data.currentARUrl}\n\n🔧 解决方案：\n1. 登录微信公众平台\n   https://mp.weixin.qq.com\n2. 进入"开发" → "开发管理" → "开发设置"\n3. 找到"业务域名"，添加域名并完成验证\n4. 验证文件需上传到服务器根目录\n\n💡 提示：如果浏览器可以访问，但小程序无法显示，99%是业务域名未配置。`,
      showCancel: true,
      confirmText: '查看详细配置',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          if (domain) {
            this.showDomainConfigGuide(domain);
          }
          this.closeARView();
        } else {
          this.closeARView();
        }
      },
    });
  },

  /**
   * 重试加载AR页面
   */
  retryARView() {
    const url = this.data.currentARUrl;
    this.setData({
      currentARUrl: '',
      arLoading: false,
      arError: '',
    });
    
    // 延迟一下再设置URL，确保web-view重新加载
    setTimeout(() => {
      this.setData({
        currentARUrl: url,
        arLoading: true,
      });
    }, 100);
  },

  /**
   * 点击展区卡片
   */
  onHallTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    this.startARExperience(id);
  },

  /**
   * 点击板块卡片
   */
  /**
   * 点击AR展区卡片
   */
  onARHallTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      console.log('点击AR展区', id);
      // 使用统一的AR体验入口，优先使用云开发AR方案（支持Hiro marker和3D模型）
      this.startARExperience(id);
    }
  },

  onSectionTap(_e: WechatMiniprogram.TouchEvent) {
    // 默认使用第一个展区进行AR体验
    // 后续可以根据section参数选择不同的展区或配置
    const defaultHallId = '1';
    this.startARExperience(defaultHallId);
  },

  /**
   * 查看使用指南
   */
  onViewGuide() {
    wx.navigateTo({
      url: '/pages/ar-guide/ar-guide',
    });
  },

  /**
   * 查看打卡进度
   */
  onViewCheckInProgress() {
    wx.showModal({
      title: '打卡进度',
      content: `已完成 ${this.data.checkInProgress.current}/${this.data.checkInProgress.total} 个打卡点`,
      showCancel: false,
    });
  },

  /**
   * web-view消息处理
   */
  onARMessage(e: WechatMiniprogram.WebviewMessage) {
    const data = e.detail.data || [];
    data.forEach((item: any) => {
      if (item.type === 'loading_progress') {
        // 资源加载进度
        console.log(`[加载进度] ${item.stage}: ${item.message}`);
        wx.showToast({
          title: item.message || '加载中...',
          icon: 'loading',
          duration: 1500,
        });
      } else if (item.type === 'resource_error') {
        // 资源加载错误
        console.error(`[资源错误] ${item.resource}: ${item.error}`);
        wx.showToast({
          title: `${item.resource}加载失败，尝试备用资源...`,
          icon: 'none',
          duration: 2000,
        });
      } else if (item.type === 'ar_loaded') {
        // AR页面基础加载完成
        console.log('AR页面基础加载完成', item);
        // 清除超时定时器
        if (this.data.arLoadTimer) {
          clearTimeout(this.data.arLoadTimer);
          this.setData({ arLoadTimer: null });
        }
        // 隐藏加载提示
        this.setData({
          arLoading: false,
          arError: '',
        });
        wx.showToast({
          title: 'AR加载完成',
          icon: 'success',
          duration: 1500,
        });
      } else if (item.type === 'scene_loaded') {
        // AR场景加载完成
        console.log('AR场景加载完成，耗时:', item.loadTime + 'ms');
        wx.showToast({
          title: 'AR场景加载完成',
          icon: 'success',
          duration: 2000,
        });
      } else if (item.type === 'scene_error') {
        // AR场景加载错误
        console.error('AR场景加载错误:', item.error);
        wx.showToast({
          title: 'AR场景加载失败',
          icon: 'none',
          duration: 3000,
        });
      } else if (item.type === 'checkin_success') {
        // 打卡成功
        this.handleCheckInSuccess(item.pointId);
      } else if (item.type === 'model_loaded') {
        // 模型加载完成
        wx.showToast({
          title: 'AR场景加载完成',
          icon: 'success',
        });
      } else if (item.type === 'ar_close') {
        // AR页面关闭
        this.closeARView();
      } else if (item.type === 'error') {
        // 错误处理
        wx.showToast({
          title: item.message || 'AR加载失败',
          icon: 'none',
        });
      }
    });
  },

  /**
   * 处理打卡成功
   */
  handleCheckInSuccess(pointId: string) {
    // 保存打卡记录
    const checkInPoints = wx.getStorageSync('ar_checkin_points') || [];
    if (!checkInPoints.includes(pointId)) {
      checkInPoints.push(pointId);
      wx.setStorageSync('ar_checkin_points', checkInPoints);
      
      // 更新进度
      this.loadCheckInProgress();
      
      // 如果完成所有打卡，解锁勋章
      if (checkInPoints.length >= this.data.checkInProgress.total) {
        this.unlockCertificate();
      }
      
      wx.showToast({
        title: '打卡成功！',
        icon: 'success',
      });
    }
  },

  /**
   * 解锁证书
   */
  unlockCertificate() {
    wx.showModal({
      title: '🎉 恭喜！',
      content: '您已完成所有AR打卡任务，解锁"监狱历史文化传播大使"专属勋章！',
      confirmText: '查看勋章',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/certificate/certificate?type=checkin',
          });
        }
      },
    });
  },
});

