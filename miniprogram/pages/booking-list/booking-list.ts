/**
 * 预约列表页面 - 查看我的所有预约记录
 */

import { getBookingList } from '../../utils/api';
import { BookingInfo, BookingStatus } from '../../utils/types';
import { formatDate, getRelativeTime } from '../../utils/common';

Page({
  data: {
    bookings: [] as BookingInfo[],
    loading: true,
    statusFilter: 'all' as 'all' | BookingStatus,
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
  },

  onLoad() {
    this.loadBookings(true);
  },

  onShow() {
    // 每次显示时刷新列表
    this.setData({ page: 1, hasMore: true });
    this.loadBookings(true);
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
      const res = await getBookingList({
        status: this.data.statusFilter === 'all' ? undefined : this.data.statusFilter,
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
      wx.showToast({
        title: e.message || '加载失败，请重试',
        icon: 'none',
      });
      this.setData({ loading: false });
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
    const statusMap: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: '待审核',
      [BookingStatus.APPROVED]: '已通过',
      [BookingStatus.REJECTED]: '已驳回',
      [BookingStatus.CANCELLED]: '已取消',
      [BookingStatus.COMPLETED]: '已完成',
    };

    return {
      ...booking,
      id: (booking as any).id?.toString?.() || (booking as any)._id || '',
      date: booking.bookingDate,
      timeSlot: booking.bookingTimeSlot,
      statusText: statusMap[booking.status] || '未知',
      relativeTime: getRelativeTime(booking.createdAt),
      formattedDate: formatDate(booking.createdAt, 'YYYY-MM-DD HH:mm'),
    };
  },

  /**
   * 切换状态筛选
   */
  onStatusFilterChange(e: WechatMiniprogram.PickerChange) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedStatus = this.data.statusOptions[selectedIndex].value;
    
    if (selectedStatus !== this.data.statusFilter) {
      this.setData({
        statusFilter: selectedStatus as any,
        page: 1,
        hasMore: true,
      });
      this.loadBookings(true);
    }
  },

  /**
   * 点击预约项
   */
  onBookingTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `/pages/booking-detail/booking-detail?id=${id}`,
      });
    }
  },
});

