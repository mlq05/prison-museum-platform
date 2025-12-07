/**
 * 预约表单页面 - 填写预约信息
 */

import { validatePhone } from '../../utils/common';
import { UserRole } from '../../utils/types';
import { BOOKING_CONFIG } from '../../utils/constants';
import { createBooking } from '../../utils/api';

Page({
  data: {
    // 预约基本信息
    bookingDate: '',
    timeSlot: '',
    timeSlotLabel: '',
    // 用户信息
    userRole: UserRole.VISITOR,
    name: '',
    phone: '',
    studentId: '',
    workId: '',
    unit: '',
    idCard: '',
    // 参观信息
    visitorCount: 1,
    // 表单验证
    errors: {} as Record<string, string>,
  },

  onLoad(options: { date?: string; timeSlot?: string }) {
    console.log('预约表单页面加载', options);
    
    if (options.date) {
      this.setData({ bookingDate: options.date });
    }
    if (options.timeSlot) {
      this.setData({ timeSlot: options.timeSlot });
      // 获取时段标签
      const timeSlots = [
        { id: 'morning1', label: '上午第一场 09:00-11:00' },
        { id: 'morning2', label: '上午第二场 11:00-13:00' },
        { id: 'afternoon1', label: '下午第一场 14:00-16:00' },
        { id: 'afternoon2', label: '下午第二场 16:00-18:00' },
      ];
      const slot = timeSlots.find(s => s.id === options.timeSlot);
      if (slot) {
        this.setData({ timeSlotLabel: slot.label });
      }
    }

    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    const app = getApp<IAppOption>();
    const userInfo = await app.getUserInfo();
    
    if (userInfo) {
      this.setData({
        userRole: userInfo.role,
        name: userInfo.name || '',
        phone: userInfo.phone || '',
        studentId: userInfo.studentId || '',
        workId: userInfo.workId || '',
        unit: userInfo.unit || '',
      });
    }
  },

  /**
   * 输入姓名
   */
  onNameInput(e: WechatMiniprogram.Input) {
    const name = e.detail.value;
    this.setData({ name });
    this.clearError('name');
  },

  /**
   * 输入手机号
   */
  onPhoneInput(e: WechatMiniprogram.Input) {
    const phone = e.detail.value.trim();
    this.setData({ phone });
    this.clearError('phone');
    
    // 实时验证
    if (phone && !validatePhone(phone)) {
      this.setError('phone', '手机号格式不正确');
    }
  },

  /**
   * 输入学号
   */
  onStudentIdInput(e: WechatMiniprogram.Input) {
    const studentId = e.detail.value;
    this.setData({ studentId });
    this.clearError('studentId');
  },

  /**
   * 输入工号
   */
  onWorkIdInput(e: WechatMiniprogram.Input) {
    const workId = e.detail.value;
    this.setData({ workId });
    this.clearError('workId');
  },

  /**
   * 输入单位
   */
  onUnitInput(e: WechatMiniprogram.Input) {
    const unit = e.detail.value;
    this.setData({ unit });
    this.clearError('unit');
  },

  /**
   * 输入班级
   */
  onIdCardInput(e: WechatMiniprogram.Input) {
    const idCard = e.detail.value;
    this.setData({ idCard });
    this.clearError('idCard');
  },

  /**
   * 选择参观人数
   */
  onVisitorCountChange(e: WechatMiniprogram.PickerChange) {
    const count = parseInt(e.detail.value) + 1;
    this.setData({ visitorCount: count });
  },


  /**
   * 表单验证
   */
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const { name, phone, visitorCount, userRole, studentId, workId, unit, idCard } = this.data;

    // 姓名必填
    const trimmedName = name ? name.trim() : '';
    if (!trimmedName) {
      errors.name = '请填写姓名';
    }

    // 手机号必填且格式正确
    const trimmedPhone = phone ? phone.trim() : '';
    if (!trimmedPhone) {
      errors.phone = '请填写手机号';
    } else if (!validatePhone(trimmedPhone)) {
      errors.phone = '手机号格式不正确';
    }

    // 根据角色验证不同字段
    if (userRole === UserRole.STUDENT) {
      const trimmedStudentId = studentId ? studentId.trim() : '';
      if (!trimmedStudentId) {
        errors.studentId = '请填写学号';
      }
    } else if (userRole === UserRole.FACULTY) {
      const trimmedWorkId = workId ? workId.trim() : '';
      if (!trimmedWorkId) {
        errors.workId = '请填写工号';
      }
    } else if (userRole === UserRole.VISITOR) {
      const trimmedUnit = unit ? unit.trim() : '';
      if (!trimmedUnit) {
        errors.unit = '请填写院系';
      }
      const trimmedIdCard = idCard ? idCard.trim() : '';
      if (!trimmedIdCard) {
        errors.idCard = '请填写班级';
      }
    }

    // 参观人数验证
    if (visitorCount < 1 || visitorCount > BOOKING_CONFIG.MAX_VISITOR_COUNT) {
      errors.visitorCount = `参观人数应在1-${BOOKING_CONFIG.MAX_VISITOR_COUNT}人之间`;
    }

    if (Object.keys(errors).length > 0) {
      this.setData({ errors });
      return false;
    }

    return true;
  },

  /**
   * 设置错误
   */
  setError(field: string, message: string) {
    this.setData({
      [`errors.${field}`]: message,
    });
  },

  /**
   * 清除错误
   */
  clearError(field: string) {
    if (this.data.errors[field]) {
      this.setData({
        [`errors.${field}`]: '',
      });
    }
  },

  /**
   * 提交预约
   */
  async onSubmit() {
    // 表单验证
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善预约信息',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true,
    });

    try {
      // 获取时段时间字符串
      const timeSlotMap: Record<string, string> = {
        'morning1': '09:00-11:00',
        'morning2': '11:00-13:00',
        'afternoon1': '14:00-16:00',
        'afternoon2': '16:00-18:00',
      };
      const bookingTimeSlot = timeSlotMap[this.data.timeSlot] || this.data.timeSlot;

      // 构建提交数据
      const submitData: any = {
        bookingDate: this.data.bookingDate,
        bookingTimeSlot: bookingTimeSlot,
        visitorCount: this.data.visitorCount,
        name: this.data.name ? this.data.name.trim() : '',
        phone: this.data.phone ? this.data.phone.trim() : '',
      };

      // 根据用户角色添加相应字段
      if (this.data.userRole === UserRole.STUDENT) {
        submitData.studentId = this.data.studentId ? this.data.studentId.trim() : '';
      } else if (this.data.userRole === UserRole.FACULTY) {
        submitData.workId = this.data.workId ? this.data.workId.trim() : '';
      } else if (this.data.userRole === UserRole.VISITOR) {
        submitData.unit = this.data.unit ? this.data.unit.trim() : '';
        submitData.idCard = this.data.idCard ? this.data.idCard.trim() : '';
      }

      const res = await createBooking(submitData);

      if (res.success && res.data) {
        // 提交成功，跳转到成功页面
        wx.redirectTo({
          url: `/pages/booking-success/booking-success?date=${this.data.bookingDate}&timeSlot=${this.data.timeSlot}&bookingId=${res.data.bookingId}`,
        });
      } else {
        throw new Error(res.message || '提交失败');
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '提交失败，请重试',
        icon: 'none',
      });
    }
  },
});

