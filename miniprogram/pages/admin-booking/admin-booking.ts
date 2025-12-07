/**
 * 预约管理页面 - 管理员审核预约 & 设置参观时段/人数
 */

import { getAdminBookingList, reviewBooking, getVisitSettings, saveVisitSettings } from '../../utils/api';
import { BookingInfo, BookingStatus } from '../../utils/types';
import { formatDate, desensitizePhone, desensitizeIdCard } from '../../utils/common';
import { getWeekday } from '../../utils/date';
import { TIME_SLOTS } from '../../utils/constants';

Page({
  data: {
    bookings: [] as BookingInfo[],
    loading: true,
    statusFilter: 'pending' as BookingStatus | 'all',
    currentStatusLabel: '待审核',
    statusOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待审核' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已驳回' },
      { value: 'cancelled', label: '已取消' },
      { value: 'completed', label: '已完成' },
    ],
    page: 1,
    pageSize: 20,
    hasMore: true,
    dateRange: {
      start: '',
      end: '',
    },
    keyword: '',
    selectedBooking: null as BookingInfo | null,
    showReviewModal: false,
    reviewAction: 'approve' as 'approve' | 'reject',
    rejectReason: '',

    // 参观时段与人数设置
    settingDate: '',
    visitSlots: [] as {
      id: string;
      label: string;
      time: string;
      capacity: number | null;
      maxPerBooking: number | null;
      isActive: boolean;
    }[],
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录管理员账号',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 默认查询今天的日期范围
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 7);

    const start = formatDate(today);
    const end = formatDate(tomorrow);

    // 立即初始化默认时段配置，确保页面可以显示
    const defaultSlots = (TIME_SLOTS as any).map((slot: any) => ({
      id: slot.id,
      label: slot.label,
      time: slot.time,
      capacity: 20,
      maxPerBooking: null,
      isActive: true,
    }));

    this.setData({
      dateRange: {
        start,
        end,
      },
      settingDate: start,
      visitSlots: defaultSlots, // 立即设置默认值，避免页面空白
      loading: false, // 确保 loading 状态正确
    });

    // 然后尝试从服务器加载配置
    this.initVisitSlots();
    this.loadBookings(true);
  },

  onShow() {
    // 每次显示时刷新列表
    this.loadBookings(true);
  },

  /**
   * 初始化参观时段配置结构
   */
  async initVisitSlots() {
    const date = this.data.settingDate;
    if (!date) {
      // 如果没有日期，使用默认配置
      const visitSlots = (TIME_SLOTS as any).map((slot: any) => ({
        id: slot.id,
        label: slot.label,
        time: slot.time,
        capacity: 20,
        maxPerBooking: null,
        isActive: true,
      }));
      this.setData({ visitSlots });
      return;
    }

    try {
      const res = await getVisitSettings({ date });
      const serverSlots = res.success && res.data ? res.data : [];

      const visitSlots = (TIME_SLOTS as any).map((slot: any) => {
        const found = serverSlots.find((s: any) => s.timeSlotId === slot.id);
        return {
          id: slot.id,
          label: slot.label,
          time: slot.time,
          capacity: found ? found.capacity : 20,
          maxPerBooking: found && found.maxPerBooking ? found.maxPerBooking : null,
          isActive: found ? found.isActive !== undefined ? !!found.isActive : true : true,
        };
      });

      this.setData({ visitSlots });
    } catch (e: any) {
      console.error('加载参观时段配置失败:', e);
      // 使用默认配置，确保页面可以正常显示
      const visitSlots = (TIME_SLOTS as any).map((slot: any) => ({
        id: slot.id,
        label: slot.label,
        time: slot.time,
        capacity: 20,
        maxPerBooking: null,
        isActive: true,
      }));
      this.setData({ visitSlots });
      
      // 如果是认证错误，提示用户重新登录
      if (e.message && (e.message.includes('认证') || e.message.includes('登录') || e.message.includes('403'))) {
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadBookings(true, true);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadBookings(false);
    }
  },

  /**
   * 加载预约列表
   */
  async loadBookings(reset: boolean = false, isRefresh: boolean = false) {
    if (!isRefresh) {
      this.setData({ loading: true });
    }

    try {
      const res = await getAdminBookingList({
        status: this.data.statusFilter === 'all' ? undefined : this.data.statusFilter,
        startDate: this.data.dateRange.start,
        endDate: this.data.dateRange.end,
        keyword: this.data.keyword || undefined,
        page: reset ? 1 : this.data.page,
        pageSize: this.data.pageSize,
      });

      if (res.success && res.data) {
        const bookings = res.data.list.map(this.formatBookingItem);
        
        this.setData({
          bookings: reset ? bookings : [...this.data.bookings, ...bookings],
          page: reset ? 2 : this.data.page + 1,
          hasMore: res.data.list.length >= this.data.pageSize,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      console.error('加载预约列表失败', e);
      
      // 如果是认证错误，提示用户重新登录
      if (e.message && (e.message.includes('认证') || e.message.includes('登录') || e.message.includes('403'))) {
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: e.message || '加载失败，请重试',
          icon: 'none',
        });
      }
      
      this.setData({ 
        loading: false,
        bookings: [], // 确保即使失败也有空数组，避免页面报错
      });
    } finally {
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 格式化预约项
   */
  formatBookingItem(booking: BookingInfo): any {
    const statusMap: Record<BookingStatus, { text: string; color: string }> = {
      [BookingStatus.PENDING]: { text: '待审核', color: '#FF9500' },
      [BookingStatus.APPROVED]: { text: '已通过', color: '#34C759' },
      [BookingStatus.REJECTED]: { text: '已驳回', color: '#FF3B30' },
      [BookingStatus.CANCELLED]: { text: '已取消', color: '#8E8E93' },
      [BookingStatus.COMPLETED]: { text: '已完成', color: '#007AFF' },
    };

    const statusInfo = statusMap[booking.status] || { text: '未知', color: '#8E8E93' };
    const bookingDate = new Date(booking.bookingDate + 'T00:00:00');

    return {
      ...booking,
      id: booking._id || '',
      statusText: statusInfo.text,
      statusColor: statusInfo.color,
      formattedDate: formatDate(bookingDate, 'YYYY-MM-DD'),
      weekday: getWeekday(bookingDate),
      formattedCreatedAt: formatDate(booking.createdAt, 'YYYY-MM-DD HH:mm'),
      maskedPhone: desensitizePhone(booking.phone),
      maskedIdCard: booking.idCard ? desensitizeIdCard(booking.idCard) : '',
    };
  },

  /**
   * 切换状态筛选
   */
  onStatusFilterChange(e: WechatMiniprogram.PickerChange) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedStatus = this.data.statusOptions[selectedIndex].value;
    const selectedLabel = this.data.statusOptions[selectedIndex].label;
    
    if (selectedStatus !== this.data.statusFilter) {
      this.setData({
        statusFilter: selectedStatus as any,
        currentStatusLabel: selectedLabel,
        page: 1,
        hasMore: true,
      });
      this.loadBookings(true);
    }
  },

  /**
   * 选择日期范围
   */
  onDateRangeChange(e: any) {
    const { start, end } = e.detail;
    this.setData({
      dateRange: { start, end },
      page: 1,
      hasMore: true,
    });
    this.loadBookings(true);
  },

  /**
   * 修改用于设置的日期
   */
  async onSettingDateChange(e: WechatMiniprogram.DatePickerChange) {
    const date = e.detail.value;
    this.setData({ settingDate: date });
    await this.initVisitSlots();
  },

  /**
   * 修改某个时段的总容量
   */
  onCapacityInput(e: WechatMiniprogram.Input) {
    const { id } = e.currentTarget.dataset;
    const value = parseInt(e.detail.value || '0', 10);
    const visitSlots = this.data.visitSlots.map((slot) =>
      slot.id === id ? { ...slot, capacity: isNaN(value) ? null : value } : slot
    );
    this.setData({ visitSlots });
  },

  /**
   * 修改某个时段单次预约上限
   */
  onMaxPerBookingInput(e: WechatMiniprogram.Input) {
    const { id } = e.currentTarget.dataset;
    const value = parseInt(e.detail.value || '0', 10);
    const visitSlots = this.data.visitSlots.map((slot) =>
      slot.id === id ? { ...slot, maxPerBooking: isNaN(value) ? null : value } : slot
    );
    this.setData({ visitSlots });
  },

  /**
   * 开关某个时段是否开放
   */
  onSlotActiveChange(e: WechatMiniprogram.SwitchChange) {
    const { id } = e.currentTarget.dataset;
    const checked = e.detail.value;
    const visitSlots = this.data.visitSlots.map((slot) =>
      slot.id === id ? { ...slot, isActive: checked } : slot
    );
    this.setData({ visitSlots });
  },

  /**
   * 保存参观时段设置
   */
  async onSaveVisitSettings() {
    if (!this.data.settingDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
      });
      return;
    }

    const slotsToSave = this.data.visitSlots
      .filter((slot) => slot.isActive && slot.capacity && slot.capacity > 0)
      .map((slot) => ({
        timeSlotId: slot.id,
        timeRange: slot.time,
        capacity: slot.capacity as number,
        maxPerBooking: slot.maxPerBooking || undefined,
        isActive: slot.isActive,
      }));

    if (!slotsToSave.length) {
      wx.showToast({
        title: '请至少保留一个开启的时段',
        icon: 'none',
      });
      return;
    }

    try {
      const res = await saveVisitSettings({
        date: this.data.settingDate,
        slots: slotsToSave,
      });

      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
        });
      } else {
        throw new Error(res.message || '保存失败');
      }
    } catch (e: any) {
      wx.showToast({
        title: e.message || '保存失败，请重试',
        icon: 'none',
      });
    }
  },

  /**
   * 搜索关键词
   */
  onKeywordInput(e: WechatMiniprogram.Input) {
    this.setData({ keyword: e.detail.value });
  },

  /**
   * 搜索
   */
  onSearch() {
    this.setData({ page: 1, hasMore: true });
    this.loadBookings(true);
  },

  /**
   * 点击预约项查看详情
   */
  async onBookingTap(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset;
    const booking = this.data.bookings[index];
    if (!booking) return;

    const formatted = this.formatBookingItem(booking as any);

    wx.showModal({
      title: '预约详情',
      content: `姓名：${booking.userName}\n电话：${formatted.maskedPhone}\n日期：${booking.bookingDate}\n时段：${booking.bookingTimeSlot}\n人数：${booking.visitorCount}人\n状态：${formatted.statusText}`,
      showCancel: false,
    });
  },

  /**
   * 审核预约 - 通过
   */
  onApproveBooking(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;

    wx.showModal({
      title: '确认通过',
      content: '确定要通过该预约申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.reviewBooking(id, 'approve');
        }
      },
    });
  },

  /**
   * 审核预约 - 驳回
   */
  onRejectBooking(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;

    // 获取预约信息
    const booking = this.data.bookings.find(b => (b._id || '') === id);
    if (!booking) return;

    this.setData({
      selectedBooking: booking,
      reviewAction: 'reject',
      rejectReason: '',
      showReviewModal: true,
    });
  },

  /**
   * 输入驳回原因
   */
  onRejectReasonInput(e: WechatMiniprogram.Input) {
    this.setData({ rejectReason: e.detail.value });
  },

  /**
   * 提交审核
   */
  async submitReview() {
    const booking = this.data.selectedBooking;
    if (!booking || !booking._id) return;

    if (this.data.reviewAction === 'reject' && !this.data.rejectReason.trim()) {
      wx.showToast({
        title: '请输入驳回原因',
        icon: 'none',
      });
      return;
    }

    await this.reviewBooking(booking._id, this.data.reviewAction);
  },

  /**
   * 执行审核
   */
  async reviewBooking(bookingId: string, action: 'approve' | 'reject') {
    wx.showLoading({
      title: '处理中...',
      mask: true,
    });

    try {
      const res = await reviewBooking({
        bookingId,
        action,
        rejectReason: action === 'reject' ? this.data.rejectReason : undefined,
      });

      if (res.success) {
        wx.hideLoading();
        wx.showToast({
          title: action === 'approve' ? '已通过' : '已驳回',
          icon: 'success',
        });

        this.setData({
          showReviewModal: false,
          selectedBooking: null,
          rejectReason: '',
        });

        // 刷新列表
        setTimeout(() => {
          this.loadBookings(true);
        }, 1000);
      } else {
        throw new Error(res.message || '操作失败');
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '操作失败，请重试',
        icon: 'none',
      });
    }
  },

  /**
   * 关闭审核弹窗
   */
  onCloseReviewModal() {
    this.setData({
      showReviewModal: false,
      selectedBooking: null,
      rejectReason: '',
    });
  },
});

