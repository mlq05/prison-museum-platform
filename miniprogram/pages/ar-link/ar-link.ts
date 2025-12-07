/**
 * ar-link.ts - AR链接页面（个人主体使用，通过外部浏览器打开）
 * 使用云开发静态网站托管部署AR页面，通过外部浏览器访问
 */

Page({
  data: {
    // AR页面URL
    arUrl: '',
    // 二维码图片URL
    qrCodeUrl: '',
    // 展区ID
    hallId: '',
    // 是否显示canvas（用于生成二维码）
    showCanvas: false,
    // 是否使用云端方案（默认true）
    useCloud: true,
  },

  onLoad(options: { hallId?: string; arUrl?: string }) {
    console.log('AR链接页面加载', options);
    
    const hallId = options.hallId || '1';
    this.setData({ hallId });
    
    // 如果直接提供了URL，使用它
    if (options.arUrl) {
      const arUrl = decodeURIComponent(options.arUrl);
      this.setData({ arUrl });
      this.generateQRCode(arUrl);
    } else {
      // 根据方案选择获取URL
      if (this.data.useCloud) {
        this.getARUrlFromCloud(hallId);
      } else {
        this.useLocalARUrl(hallId);
      }
    }
  },

  /**
   * 从云开发获取AR页面URL
   */
  getARUrlFromCloud(hallId: string) {
    // 检查是否已初始化云开发
    if (!wx.cloud) {
      console.warn('云开发未初始化，使用默认URL');
      this.useDefaultARUrl(hallId);
      return;
    }

    // 调用云函数获取AR URL
    wx.cloud.callFunction({
      name: 'getARUrl',
      data: { hallId },
      success: (res: any) => {
        console.log('云函数调用成功', res);
        if (res.result && res.result.success) {
          const arUrl = res.result.data.arUrl;
          this.setData({ arUrl });
          this.generateQRCode(arUrl);
        } else {
          console.warn('云函数返回失败，使用默认URL');
          this.useDefaultARUrl(hallId);
        }
      },
      fail: (err) => {
        console.error('云函数调用失败', err);
        // 云函数调用失败，直接使用默认URL（不弹窗提示，静默降级）
        this.useDefaultARUrl(hallId);
      },
    });
  },

  /**
   * 使用本地AR方案（个人主体暂时无法实现，保持占位）
   */
  useLocalARUrl(hallId: string) {
    // 个人主体小程序无法使用web-view，本地方案暂时无法实现
    // 这里保持一个占位URL，实际功能待后续实现
    const localUrl = `#本地AR方案暂未实现（个人主体限制）`;
    this.setData({ arUrl: localUrl });
    // 不生成二维码，因为URL无效
    this.setData({ qrCodeUrl: '' });
    
    wx.showToast({
      title: '本地方案暂未实现',
      icon: 'none',
      duration: 2000,
    });
  },

  /**
   * 切换到云端方案
   */
  switchToCloud() {
    if (this.data.useCloud) return;
    this.setData({ useCloud: true });
    this.getARUrlFromCloud(this.data.hallId);
  },

  /**
   * 切换到本地方案
   */
  switchToLocal() {
    if (!this.data.useCloud) return;
    this.setData({ useCloud: false });
    this.useLocalARUrl(this.data.hallId);
  },

  /**
   * 使用默认AR URL（如果云函数不可用）
   */
  useDefaultARUrl(hallId: string) {
    // 从云开发环境获取静态网站托管域名
    // 使用静态网站托管实际访问域名
    const cloudHostingUrl = 'https://prison-museum-dev-8e6hujc6eb768b-1390408503.tcloudbaseapp.com';
    const arPageUrl = `${cloudHostingUrl}/marker-ar-simple.html?hallId=${hallId}`;
    
    this.setData({ arUrl: arPageUrl });
    this.generateQRCode(arPageUrl);
  },

  /**
   * 生成二维码
   */
  generateQRCode(url: string) {
    // 方法1：使用第三方API生成二维码图片
    // 注意：需要确保URL长度不超过限制
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    this.setData({ qrCodeUrl: qrApiUrl });
    
    // 方法2：使用小程序内置API生成二维码（需要基础库支持）
    // 或者使用云函数生成小程序码
    // 这里先使用第三方API作为示例
  },

  /**
   * 复制链接
   */
  copyLink() {
    if (!this.data.arUrl) {
      wx.showToast({
        title: '链接未生成',
        icon: 'none',
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.arUrl,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 2000,
        });
        
        // 提示用户下一步操作
        setTimeout(() => {
          wx.showModal({
            title: '下一步操作',
            content: '链接已复制到剪贴板\n\n请在浏览器中粘贴并打开链接，然后允许摄像头权限即可开始AR体验',
            showCancel: false,
            confirmText: '知道了',
          });
        }, 2000);
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
        });
      },
    });
  },

  /**
   * 显示Hiro Marker指南
   */
  showMarkerGuide() {
    wx.showModal({
      title: 'Hiro Marker',
      content: 'Hiro marker是AR.js默认提供的识别图案。\n\n你可以：\n1. 访问在线查看：https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg\n2. 打印或显示在另一个设备屏幕上\n3. 将marker对准摄像头进行识别\n\n或者生成自定义Marker：\nhttps://ar-js-org.github.io/AR.js-Docs/marker-training/',
      showCancel: false,
      confirmText: '我知道了',
    });
  },
});

