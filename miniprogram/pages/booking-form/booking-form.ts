/**
 * 预约表单页面 - 填写预约信息
 */

import { validatePhone } from '../../utils/common';
import { UserRole } from '../../utils/types';
import { BOOKING_CONFIG } from '../../utils/constants';
import { createBooking, getVisitSettings, checkOpenDay } from '../../utils/api';

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
    maxVisitorCount: 10, // 最大参观人数（从管理员配置获取）
    visitorCountOptions: [1,2,3,4,5,6,7,8,9,10], // 人数选择选项
    // 备注信息
    remark: '',
    // 领导来访标识
    isLeaderVisit: false,
    // 是否是开放日
    isOpenDay: false,
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
    this.loadVisitSettings();
    
    // 如果已有日期，检查是否是开放日
    if (options.date) {
      this.checkOpenDayStatus(options.date);
    }
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
   * 加载参观时段配置（获取人数上限）
   */
  async loadVisitSettings() {
    const { bookingDate, timeSlot } = this.data;
    if (!bookingDate || !timeSlot) {
      return;
    }

    try {
      const res = await getVisitSettings({ date: bookingDate });
      if (res.success && res.data && res.data.length > 0) {
        // 时段ID映射（从 timeSlot 转为 timeSlotId）
        const timeSlotIdMap: Record<string, string> = {
          'morning1': 'morning1',
          'morning2': 'morning2',
          'afternoon1': 'afternoon1',
          'afternoon2': 'afternoon2',
        };
        const timeSlotId = timeSlotIdMap[timeSlot] || timeSlot;
        
        // 找到对应时段的配置
        const slotConfig = res.data.find((s: any) => s.timeSlotId === timeSlotId);
        if (slotConfig) {
          // 如果设置了单次预约上限，使用它；否则使用总名额上限
          const maxCount = slotConfig.maxPerBooking || slotConfig.capacity || BOOKING_CONFIG.MAX_VISITOR_COUNT;
          // 生成人数选择选项
          const options = Array.from({ length: maxCount }, (_, i) => i + 1);
          
          this.setData({
            maxVisitorCount: maxCount,
            visitorCountOptions: options,
            // 如果当前选择的人数超过上限，调整为上限
            visitorCount: Math.min(this.data.visitorCount, maxCount),
          });
        } else {
          // 如果没有找到配置，使用默认值
          const defaultMax = BOOKING_CONFIG.MAX_VISITOR_COUNT;
          const options = Array.from({ length: defaultMax }, (_, i) => i + 1);
          this.setData({
            maxVisitorCount: defaultMax,
            visitorCountOptions: options,
          });
        }
      } else {
        // 如果没有配置数据，使用默认值
        const defaultMax = BOOKING_CONFIG.MAX_VISITOR_COUNT;
        const options = Array.from({ length: defaultMax }, (_, i) => i + 1);
        this.setData({
          maxVisitorCount: defaultMax,
          visitorCountOptions: options,
        });
      }
    } catch (e) {
      console.error('加载参观时段配置失败:', e);
      // 使用默认值，不影响表单使用
      const defaultMax = BOOKING_CONFIG.MAX_VISITOR_COUNT;
      const options = Array.from({ length: defaultMax }, (_, i) => i + 1);
      this.setData({
        maxVisitorCount: defaultMax,
        visitorCountOptions: options,
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
    const index = parseInt(e.detail.value);
    const count = this.data.visitorCountOptions[index] || 1;
    this.setData({ visitorCount: count });
  },

  /**
   * 输入备注
   */
  onRemarkInput(e: WechatMiniprogram.Textarea) {
    const remark = e.detail.value;
    this.setData({ remark });
  },

  /**
   * 切换领导来访标识
   */
  onLeaderVisitChange(e: WechatMiniprogram.SwitchChange) {
    this.setData({ isLeaderVisit: e.detail.value });
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
    const maxCount = this.data.maxVisitorCount || BOOKING_CONFIG.MAX_VISITOR_COUNT;
    if (visitorCount < 1 || visitorCount > maxCount) {
      errors.visitorCount = `参观人数应在1-${maxCount}人之间`;
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
    // 检查是否是开放日
    if (this.data.isOpenDay) {
      wx.showModal({
        title: '开放日提示',
        content: '该日期为开放日，无需预约即可直接参观。确定要继续提交预约吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户确认继续预约，执行后续流程
            this.doSubmit();
          }
        },
      });
      return;
    }
    
    // 执行提交
    this.doSubmit();
  },

  /**
   * 执行提交预约
   */
  async doSubmit() {
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
        remark: this.data.remark ? this.data.remark.trim() : '', // 备注信息
        isLeaderVisit: this.data.isLeaderVisit, // 领导来访标识
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

