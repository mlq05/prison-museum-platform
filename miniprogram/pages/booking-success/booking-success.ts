/**
 * 预约成功页面 - 显示预约成功信息和AR使用指南
 */

import { TIME_SLOTS } from '../../utils/constants';

Page({
  data: {
    bookingDate: '',
    timeSlot: '',
    timeSlotLabel: '', // 时段显示文本（如：09:00-11:00）
    bookingId: '',
    // 印章动画
    showSeal: false,
    // AR使用指南步骤
    arGuideSteps: [
      {
        id: 1,
        title: '找到展区二维码',
        desc: '在展区入口处找到AR体验二维码标识',
        icon: '/assets/icons/qrcode.png',
      },
      {
        id: 2,
        title: '打开小程序AR功能',
        desc: '点击"AR体验"菜单，选择对应展区',
        icon: '/assets/icons/ar.png',
      },
      {
        id: 3,
        title: '扫描二维码',
        desc: '将手机摄像头对准二维码，保持30-50cm距离',
        icon: '/assets/icons/camera.png',
      },
      {
        id: 4,
        title: '开始探索',
        desc: '3D模型出现后，点击模型查看知识点，听语音解说',
        icon: '/assets/icons/interact.png',
      },
    ],
  },

  onLoad(options: { date?: string; timeSlot?: string; bookingId?: string }) {
    console.log('预约成功页面加载', options);
    
    if (options.date) this.setData({ bookingDate: options.date });
    if (options.timeSlot) {
      this.setData({ timeSlot: options.timeSlot });
      // 将时段ID转换为具体时间
      this.convertTimeSlot(options.timeSlot);
    }
    if (options.bookingId) this.setData({ bookingId: options.bookingId });

    // 播放印章动画
    this.playSealAnimation();
  },

  /**
   * 转换时段ID为具体时间
   */
  convertTimeSlot(timeSlotId: string) {
    // 如果已经是时间格式（包含 '-' 和 ':'），直接使用
    if (timeSlotId.includes('-') && timeSlotId.includes(':')) {
      this.setData({ timeSlotLabel: timeSlotId });
      return;
    }
    
    // 从时段配置中查找对应的时间
    const slot = TIME_SLOTS.find(s => s.id === timeSlotId);
    if (slot) {
      this.setData({ timeSlotLabel: slot.time }); // 例如：'09:00-11:00'
    } else {
      // 如果找不到，显示原始值
      console.warn('未找到时段配置:', timeSlotId);
      this.setData({ timeSlotLabel: timeSlotId });
    }
  },

  /**
   * 播放印章动画
   */
  playSealAnimation() {
    setTimeout(() => {
      this.setData({ showSeal: true });
      
      // 播放音效
      wx.vibrateShort({
        type: 'heavy',
      });
    }, 300);
  },

  /**
   * 查看预约详情
   */
  onViewBookingDetail() {
    if (this.data.bookingId) {
      wx.redirectTo({
        url: `/pages/booking-detail/booking-detail?id=${this.data.bookingId}`,
      });
    } else {
      wx.navigateBack();
    }
  },

  /**
   * 立即体验AR
   */
  onTryAR() {
    wx.navigateTo({
      url: '/pages/ar-experience/ar-experience',
    });
  },

  /**
   * 添加到日历
   */
  onAddToCalendar() {
    wx.showToast({
      title: '已添加到微信日程',
      icon: 'success',
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
});

