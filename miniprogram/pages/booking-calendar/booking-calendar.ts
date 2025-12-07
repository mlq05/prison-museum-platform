/**
 * 预约日历页面 - 选择参观日期和时段
 */

import { formatDate, getDateRange } from '../../utils/common';
import { TIME_SLOTS, BOOKING_CONFIG } from '../../utils/constants';
import { getWeekday, getDateDay } from '../../utils/date';
import { getBookingCalendar } from '../../utils/api';
import { DateBookingInfo } from '../../utils/types';

Page({
  data: {
    // 日期范围（未来30天）
    dates: [] as string[],
    // 选中的日期
    selectedDate: '',
    // 日期预约信息
    dateBookingMap: {} as Record<string, any>,
    // 时段列表
    timeSlots: TIME_SLOTS as any[],
    // 选中的时段
    selectedTimeSlot: '',
    // 最小可选日期（今天+1天）
    minDate: '',
    // 最大可选日期（今天+30天）
    maxDate: '',
    // 工具函数（用于wxml）
    getWeekday: getWeekday,
    getDateDay: getDateDay,
    // 日期列表加载状态
    datesLoading: true,
  },

  onLoad() {
    console.log('预约日历页面加载');
    this.initPage();
  },

  onReady() {
    // 确保页面渲染完成后数据已加载
    console.log('预约日历页面准备完成，日期列表:', this.data.dates.length);
    if (this.data.dates.length === 0) {
      console.warn('警告：日期列表为空，重新初始化');
      // 如果日期列表为空，重新初始化
      setTimeout(() => {
        this.initPage();
      }, 100);
    }
  },

  onShow() {
    // 每次显示页面时，确保日期列表已加载
    if (!this.data.dates || this.data.dates.length === 0) {
      console.log('页面显示时日期列表为空，重新初始化');
      this.initPage();
    }
  },

  /**
   * 初始化页面
   */
  initPage() {
    // 设置日期范围 - 从今天开始，未来7天（共8天）
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间，确保日期比较准确
    
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // 今天 + 未来7天 = 共8天
    endDate.setHours(0, 0, 0, 0);

    // 生成日期列表（从今天开始，共8天）
    const dates: string[] = [];
    
    // 生成今天及未来7天的日期
    for (let i = 0; i < 8; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = formatDate(currentDate);
      dates.push(dateStr);
    }

    console.log('生成的日期列表:', dates);
    console.log('日期数量:', dates.length);
    console.log('第一个日期:', dates[0]);
    console.log('最后一个日期:', dates[dates.length - 1]);

    if (dates.length === 0) {
      console.error('日期列表为空！使用默认日期');
      // 如果日期列表为空，至少生成今天的日期
      dates.push(formatDate(today));
    }

    // 设置所有数据，确保日期列表能立即显示
    this.setData({
      dates: dates,
      minDate: formatDate(startDate),
      maxDate: formatDate(endDate),
      datesLoading: false,
    }, () => {
      console.log('日期列表已设置到页面数据，数量:', this.data.dates.length);
      console.log('当前页面日期列表:', this.data.dates);
      console.log('第一个日期项:', this.data.dates[0]);
      // 加载预约数据
      this.loadBookingData();
    });
  },

  /**
   * 加载预约数据
   */
  async loadBookingData() {
    // 确保日期列表已初始化
    if (!this.data.dates || this.data.dates.length === 0) {
      console.warn('日期列表为空，跳过加载预约数据');
      // 如果日期列表为空，先初始化一个默认的日期列表
      this.initDefaultDates();
      return;
    }

    try {
      const startDate = this.data.dates[0];
      const endDate = this.data.dates[this.data.dates.length - 1];

      if (!startDate || !endDate) {
        console.warn('日期范围无效');
        this.initDefaultDates();
        return;
      }

      // 先初始化默认数据，确保页面可以正常使用
      this.initDefaultDates();

      // 尝试加载真实数据（静默失败，不影响用户体验）
      try {
        const res = await getBookingCalendar({
          startDate,
          endDate,
        });

        const dateBookingMap: Record<string, any> = {};

        if (res.success && res.data) {
          // 将API返回的数据转换为map
          res.data.forEach((dateBooking: DateBookingInfo) => {
            dateBookingMap[dateBooking.date] = {
              date: dateBooking.date,
              timeSlots: dateBooking.timeSlots,
              totalAvailable: dateBooking.totalAvailable,
              isFull: dateBooking.isFull,
            };
          });
        }

        // 为没有数据的日期填充默认值
        this.data.dates.forEach(date => {
          if (!dateBookingMap[date]) {
            dateBookingMap[date] = {
              date,
              timeSlots: TIME_SLOTS.map(slot => ({
                id: slot.id,
                label: slot.label,
                time: slot.time,
                available: 20, // 默认名额
                total: 20,
                isWarning: false,
              })),
              totalAvailable: 80,
              isFull: false,
            };
          } else {
            // 确保时段数据包含label字段，并更新预警状态
            dateBookingMap[date].timeSlots = dateBookingMap[date].timeSlots.map((slot: any) => {
              const configSlot = TIME_SLOTS.find(s => s.id === slot.id);
              return {
                ...slot,
                label: slot.label || configSlot?.label || '',
                time: slot.time || configSlot?.time || '',
                isWarning: slot.available <= BOOKING_CONFIG.WARNING_THRESHOLD,
              };
            });
          }
        });

        // 如果成功获取数据，更新页面
        this.setData({ dateBookingMap });
      } catch (networkError) {
        // 网络错误时静默失败，使用已初始化的默认数据
        console.warn('网络请求失败，使用默认数据', networkError);
        // 不显示错误提示，不影响用户体验
      }
    } catch (e) {
      console.warn('加载预约数据异常，使用默认数据', e);
      // 使用默认数据
      this.initDefaultDates();
    }
  },

  /**
   * 初始化默认日期数据
   */
  initDefaultDates() {
    if (!this.data.dates || this.data.dates.length === 0) {
      console.warn('初始化默认日期列表');
      // 如果日期列表为空，重新初始化
      this.initPage();
      return;
    }

    const dateBookingMap: Record<string, any> = {};
    this.data.dates.forEach(date => {
      dateBookingMap[date] = {
        date,
        timeSlots: TIME_SLOTS.map(slot => ({
          id: slot.id,
          label: slot.label,
          time: slot.time,
          available: 20,
          total: 20,
          isWarning: false,
        })),
        totalAvailable: 80,
        isFull: false,
      };
    });
    this.setData({ dateBookingMap });
  },

  /**
   * 选择日期
   */
  onDateSelect(e: WechatMiniprogram.TouchEvent) {
    const { date } = e.currentTarget.dataset;
    if (!date) {
      console.error('日期数据为空');
      return;
    }
    console.log('选择日期:', date);
    this.setData({ 
      selectedDate: date, 
      selectedTimeSlot: '' 
    });
    this.loadTimeSlotsForDate(date);
  },

  /**
   * 加载指定日期的时段信息
   */
  loadTimeSlotsForDate(date: string) {
    const dateBooking = this.data.dateBookingMap[date];
    if (dateBooking && dateBooking.timeSlots) {
      // 将时段数据与配置合并，确保有label字段
      const timeSlots = dateBooking.timeSlots.map((slot: any) => {
        const configSlot = TIME_SLOTS.find(s => s.id === slot.id);
        return {
          ...slot,
          label: configSlot ? configSlot.label : slot.label || '',
          time: slot.time || configSlot?.time || '',
          isWarning: slot.available <= BOOKING_CONFIG.WARNING_THRESHOLD,
        };
      });
      this.setData({ timeSlots });
    } else {
      // 如果没有数据，使用默认配置
      const timeSlots = TIME_SLOTS.map(slot => ({
        ...slot,
        available: 20,
        total: 20,
        isWarning: false,
      }));
      this.setData({ timeSlots });
    }
  },

  /**
   * 选择时段
   */
  onTimeSlotSelect(e: WechatMiniprogram.TouchEvent) {
    const { slot } = e.currentTarget.dataset;
    if (slot.available <= 0) {
      wx.showToast({
        title: '该时段已满',
        icon: 'none',
      });
      return;
    }
    this.setData({ selectedTimeSlot: slot.id });
  },

  /**
   * 下一步 - 填写预约信息
   */
  onNext() {
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
      });
      return;
    }

    if (!this.data.selectedTimeSlot) {
      wx.showToast({
        title: '请选择时段',
        icon: 'none',
      });
      return;
    }

    // 检查是否还有名额
    const dateBooking = this.data.dateBookingMap[this.data.selectedDate];
    const selectedSlot = dateBooking.timeSlots.find((s: any) => s.id === this.data.selectedTimeSlot);
    
    if (!selectedSlot || selectedSlot.available <= 0) {
      wx.showToast({
        title: '该时段已满，请重新选择',
        icon: 'none',
      });
      return;
    }

    // 跳转到预约表单页
    wx.navigateTo({
      url: `/pages/booking-form/booking-form?date=${this.data.selectedDate}&timeSlot=${this.data.selectedTimeSlot}`,
    });
  },
});

