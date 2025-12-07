/**
 * 知识闯关结果页面
 */
Page({
  data: {
    score: 0,
    total: 10,
    correct: 0,
    passed: false,
    scrollHeight: '550px',
    correctRate: 0, // 正确率
  },
  
  onLoad(options: { score?: string; total?: string; correct?: string; passed?: string }) {
    this.initPage();
    
    const score = options.score ? parseInt(options.score) : 0;
    const total = options.total ? parseInt(options.total) : 10;
    const correct = options.correct ? parseInt(options.correct) : 0;
    const passed = options.passed === '1';
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    this.setData({
      score,
      total,
      correct,
      passed,
      correctRate,
    });
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
   * 查看证书
   */
  async onViewCertificate() {
    if (!this.data.passed) {
      wx.showToast({
        title: '未达到及格分数',
        icon: 'none',
      });
      return;
    }
    
    // 生成证书
    try {
      const { generateCertificate } = await import('../../utils/api');
      const userInfo = wx.getStorageSync('userInfo') || {};
      const userName = userInfo.nickName || '游客';
      
      const res = await generateCertificate({
        type: 'game',
        title: '知识闯关证书',
        content: `恭喜您通过知识闯关测试，得分${this.data.score}分，展现了您对中国监狱历史文化的深入了解。`,
        gameScore: this.data.score,
        gameTotalScore: 100,
      });
      
      if (res.success && res.data) {
        // 跳转到证书页面
        wx.navigateTo({
          url: `/pages/certificate/certificate?id=${res.data.certificateId || res.data.id}&type=game`,
        });
      } else {
        // 如果生成失败，仍然跳转（使用本地数据）
        wx.navigateTo({
          url: `/pages/certificate/certificate?type=game&score=${this.data.score}&total=${this.data.total}&correct=${this.data.correct}`,
        });
      }
    } catch (error) {
      console.error('生成证书失败', error);
      // 失败时仍然跳转，使用本地数据
      wx.navigateTo({
        url: `/pages/certificate/certificate?type=game&score=${this.data.score}&total=${this.data.total}&correct=${this.data.correct}`,
      });
    }
  },

  /**
   * 重新答题
   */
  onRetry() {
    wx.redirectTo({
      url: '/pages/knowledge-game/knowledge-game',
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
});

