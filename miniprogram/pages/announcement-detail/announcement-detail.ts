/**
 * 公告详情页面
 */

import { getAnnouncementDetail } from '../../utils/api';
import { formatDate } from '../../utils/common';

Page({
  data: {
    announcement: null as {
      _id: string;
      title: string;
      summary: string;
      content: string;
      status: 'draft' | 'published';
      publishAt: number | null;
      expireAt: number | null;
      createdAt: number;
      updatedAt: number;
    } | null,
    loading: true,
  },

  onLoad(options: { id?: string }) {
    const { id } = options;
    if (id) {
      this.loadAnnouncement(id);
    } else {
      wx.showToast({
        title: '公告ID不能为空',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载公告详情
   */
  async loadAnnouncement(id: string) {
    this.setData({ loading: true });
    try {
      const res = await getAnnouncementDetail(id);
      if (res.success && res.data) {
        this.setData({
          announcement: res.data,
          loading: false,
        });
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      wx.showToast({
        title: e.message || '加载失败',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

});

