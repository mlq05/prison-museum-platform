/**
 * ar-webview.ts - 使用web-view承载A-Frame+AR.js实现的AR页面
 * 注意：此功能需要企业主体，个人主体无法使用web-view
 */

Page({
  data: {
    // AR页面URL
    arUrl: '',
    // 加载状态
    loading: true,
    // 错误信息
    error: '',
  },

  onLoad(options: { url?: string; hallId?: string; marker?: string; model?: string }) {
    console.log('AR WebView页面加载', options);
    
    // 构建AR页面URL
    let arUrl = '';
    
    // 如果直接提供了URL，使用它
    if (options.url) {
      arUrl = decodeURIComponent(options.url);
    } else {
      // 否则根据参数构建URL
      // 默认使用简化版AR页面
      const baseUrl = 'https://your-domain.com/miniprogram/ar-pages/marker-ar-simple.html';
      const params: string[] = [];
      
      if (options.hallId) {
        params.push(`hallId=${options.hallId}`);
      }
      if (options.marker) {
        params.push(`marker=${encodeURIComponent(options.marker)}`);
      }
      if (options.model) {
        params.push(`model=${encodeURIComponent(options.model)}`);
      }
      
      arUrl = params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
    }
    
    // 检查URL格式
    if (!arUrl.startsWith('http://') && !arUrl.startsWith('https://')) {
      this.setData({
        error: 'AR页面URL格式不正确，必须以http://或https://开头\n\n注意：个人主体无法使用web-view，请使用xr-frame方案（pages/ar-xr/ar-xr）',
        loading: false,
      });
      return;
    }
    
    // 检查是否是HTTPS
    if (!arUrl.startsWith('https://')) {
      this.setData({
        error: 'web-view只支持HTTPS协议，请使用https://开头的URL',
        loading: false,
      });
      return;
    }
    
    console.log('AR页面URL:', arUrl);
    this.setData({ arUrl });
  },

  /**
   * web-view加载成功
   */
  onWebViewLoad(e: WechatMiniprogram.WebviewLoad) {
    console.log('web-view加载成功', e.detail);
    this.setData({ loading: false });
  },

  /**
   * web-view加载失败
   */
  onWebViewError(e: WechatMiniprogram.WebviewError) {
    console.error('web-view加载失败', e.detail);
    
    let errorMsg = 'AR页面加载失败';
    
    // 提取域名
    let domain = '';
    try {
      const url = this.data.arUrl;
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
    
    // 判断可能的错误原因
    if (domain && !domain.includes('localhost') && !domain.startsWith('127.')) {
      errorMsg = `AR页面加载失败\n\n⚠️ 最常见原因：业务域名未配置！\n\n当前域名: ${domain}\n\n🔧 解决方案：\n1. 登录微信公众平台\n2. 进入"开发" → "开发管理" → "开发设置"\n3. 找到"业务域名"，添加域名并完成验证\n\n💡 提示：个人主体无法使用web-view，请使用xr-frame方案`;
    } else {
      errorMsg = 'AR页面加载失败\n\n可能的原因：\n1. 个人主体无法使用web-view（需要企业主体）\n2. 业务域名未配置\n3. AR页面URL不正确\n\n💡 建议：使用xr-frame方案（pages/ar-xr/ar-xr）';
    }
    
    this.setData({
      error: errorMsg,
      loading: false,
    });
  },

  /**
   * 接收web-view消息
   */
  onWebViewMessage(e: WechatMiniprogram.WebviewMessage) {
    console.log('收到web-view消息', e.detail);
    const data = e.detail.data || [];
    
    data.forEach((item: any) => {
      if (item.type === 'ar_close') {
        // AR页面请求关闭
        this.goBack();
      } else if (item.type === 'checkin_success') {
        // 打卡成功
        wx.showToast({
          title: '打卡成功！',
          icon: 'success',
        });
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
   * 重试加载
   */
  retryLoad() {
    this.setData({ error: '', loading: true });
    // 重新设置URL以触发重新加载
    const arUrl = this.data.arUrl;
    this.setData({ arUrl: '' });
    setTimeout(() => {
      this.setData({ arUrl });
    }, 100);
  },

  /**
   * 返回
   */
  goBack() {
    wx.navigateBack();
  },
});

