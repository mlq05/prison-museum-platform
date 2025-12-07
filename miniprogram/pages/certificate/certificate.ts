/**
 * 证书页面
 */
import { getCertificateDetail, generateCertificate } from '../../utils/api';

Page({
  data: {
    certificateType: '',
    certificate: null as any,
    certificateId: '',
    // 临时数据（用于知识闯关）
    score: 0,
    total: 10,
    correct: 0,
    loading: true,
    scrollHeight: '550px',
  },
  
  onLoad(options: { type?: string; id?: string; score?: string; total?: string; correct?: string }) {
    this.initPage();
    
    if (options.id) {
      // 从服务器加载证书
      this.setData({
        certificateId: options.id,
        certificateType: options.type || 'game',
      });
      this.loadCertificate();
    } else if (options.type) {
      // 使用临时数据生成证书
      this.setData({
        certificateType: options.type,
        score: options.score ? parseInt(options.score) : 0,
        total: options.total ? parseInt(options.total) : 10,
        correct: options.correct ? parseInt(options.correct) : 0,
        loading: false,
      });
      this.generateLocalCertificate();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
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
    const scrollHeight = windowHeight - navBarHeight;
    
    this.setData({
      scrollHeight: scrollHeight + 'px',
    });
  },

  /**
   * 加载证书
   */
  async loadCertificate() {
    try {
      const res = await getCertificateDetail(this.data.certificateId);
      if (res.success && res.data) {
        this.setData({
          certificate: res.data,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (error) {
      console.error('加载证书失败', error);
      wx.showToast({
        title: '加载证书失败',
        icon: 'none',
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 生成本地证书（临时使用）
   */
  generateLocalCertificate() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const userName = userInfo.nickName || '游客';
    const { score, total, correct, certificateType } = this.data;
    
    let title = '';
    let content = '';
    
    if (certificateType === 'game') {
      title = '知识闯关证书';
      content = `恭喜您通过知识闯关测试，得分${score}分（满分${total}分），答对${correct}题，展现了您对中国监狱历史文化的深入了解。`;
    }
    
    const issueDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    this.setData({
      certificate: {
        title,
        content,
        userName,
        issueDate,
        certificateNumber,
        type: certificateType,
        gameScore: score,
        gameTotalScore: total,
      },
    });
  },

  /**
   * 分享证书
   */
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
  },

  /**
   * 导出PDF（暂时提示）
   */
  onExportPDF() {
    wx.showToast({
      title: 'PDF导出功能开发中',
      icon: 'none',
    });
  },

  /**
   * 保存证书到相册
   */
  async onSaveImage() {
    // 这里可以实现将证书保存为图片的功能
    wx.showToast({
      title: '保存功能开发中',
      icon: 'none',
    });
  },
});

