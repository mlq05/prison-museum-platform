/**
 * 预约详情页面
 */

import { getBookingDetail, cancelBooking } from '../../utils/api';
import { BookingInfo, BookingStatus } from '../../utils/types';
import { formatDate, desensitizePhone, desensitizeIdCard } from '../../utils/common';
import { getWeekday } from '../../utils/date';

Page({
  data: {
    bookingId: '',
    booking: null as BookingInfo | null,
    loading: true,
    formattedBooking: null as any,
  },

  onLoad(options: { id?: string }) {
    if (options.id) {
      this.setData({ bookingId: options.id });
      this.loadBookingDetail();
    } else {
      wx.showToast({
        title: '预约ID无效',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载预约详情
   */
  async loadBookingDetail() {
    this.setData({ loading: true });

    try {
      const res = await getBookingDetail(this.data.bookingId);

      if (res.success && res.data) {
        const formatted = this.formatBooking(res.data);
        this.setData({
          booking: res.data,
          formattedBooking: formatted,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      console.error('加载预约详情失败', e);
      wx.showToast({
        title: e.message || '加载失败，请重试',
        icon: 'none',
      });
      this.setData({ loading: false });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 格式化预约信息用于显示
   */
  formatBooking(booking: BookingInfo): any {
    const statusMap: Record<BookingStatus, { text: string; color: string }> = {
      [BookingStatus.PENDING]: { text: '待审核', color: '#FF9500' },
      [BookingStatus.APPROVED]: { text: '已通过', color: '#34C759' },
      [BookingStatus.REJECTED]: { text: '已驳回', color: '#FF3B30' },
      [BookingStatus.CANCELLED]: { text: '已取消', color: '#8E8E93' },
      [BookingStatus.COMPLETED]: { text: '已完成', color: '#007AFF' },
    };

    const roleMap: Record<string, string> = {
      student: '学生',
      faculty: '教职工',
      visitor: '校外访客',
    };

    const statusInfo = statusMap[booking.status] || { text: '未知', color: '#8E8E93' };
    const bookingDate = new Date(booking.bookingDate + 'T00:00:00');

    return {
      ...booking,
      statusText: statusInfo.text,
      statusColor: statusInfo.color,
      roleText: roleMap[booking.userRole] || '未知',
      formattedDate: formatDate(bookingDate, 'YYYY年MM月DD日'),
      weekday: getWeekday(bookingDate),
      formattedCreatedAt: formatDate(booking.createdAt, 'YYYY-MM-DD HH:mm'),
      formattedReviewedAt: booking.reviewedAt ? formatDate(booking.reviewedAt, 'YYYY-MM-DD HH:mm') : '',
      maskedPhone: desensitizePhone(booking.phone),
      maskedIdCard: booking.idCard ? desensitizeIdCard(booking.idCard) : '',
      canCancel: booking.status === BookingStatus.PENDING || booking.status === BookingStatus.APPROVED,
      canExport: booking.status === BookingStatus.APPROVED || booking.status === BookingStatus.COMPLETED,
    };
  },

  /**
   * 取消预约
   */
  onCancelBooking() {
    const booking = this.data.formattedBooking;
    if (!booking) return;

    wx.showModal({
      title: '取消预约',
      content: `确定要取消${booking.formattedDate} ${booking.bookingTimeSlot}的预约吗？`,
      confirmText: '确定取消',
      cancelText: '我再想想',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await this.cancelBookingRequest();
        }
      },
    });
  },

  /**
   * 执行取消预约请求
   */
  async cancelBookingRequest() {
    wx.showLoading({
      title: '取消中...',
      mask: true,
    });

    try {
      const res = await cancelBooking(this.data.bookingId);

      if (res.success) {
        wx.hideLoading();
        wx.showToast({
          title: '已取消预约',
          icon: 'success',
        });
        
        // 刷新详情
        setTimeout(() => {
          this.loadBookingDetail();
        }, 1500);
      } else {
        throw new Error(res.message || '取消失败');
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '取消失败，请重试',
        icon: 'none',
      });
    }
  },

  /**
   * 导出预约凭证
   */
  async onExportCertificate() {
    const booking = this.data.formattedBooking;
    if (!booking || !booking.canExport) {
      wx.showToast({
        title: '该预约无法导出凭证',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '生成凭证中...',
      mask: true,
    });

    try {
      // TODO: 调用后端API生成PDF凭证
      // 这里暂时使用小程序canvas生成图片
      wx.showToast({
        title: '功能开发中',
        icon: 'none',
      });
      
      // 实际实现时应该：
      // 1. 调用后端API生成PDF
      // 2. 下载PDF文件
      // 3. 使用wx.openDocument打开PDF
      
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '导出失败',
        icon: 'none',
      });
    }
  },

  /**
   * 复制预约信息
   */
  onCopyBookingInfo() {
    const booking = this.data.formattedBooking;
    if (!booking) return;

    const info = `预约信息\n日期：${booking.formattedDate} ${booking.weekday}\n时段：${booking.bookingTimeSlot}\n人数：${booking.visitorCount}人\n状态：${booking.statusText}`;

    wx.setClipboardData({
      data: info,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        });
      },
    });
  },

  /**
   * 联系管理员
   */
  onContactAdmin() {
    wx.showActionSheet({
      itemList: ['拨打电话', '在线客服'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: '400-xxx-xxxx', // TODO: 替换为实际客服电话
          });
        } else if (res.tapIndex === 1) {
          // TODO: 跳转到客服页面或打开客服会话
          wx.showToast({
            title: '客服功能开发中',
            icon: 'none',
          });
        }
      },
    });
  },
});

