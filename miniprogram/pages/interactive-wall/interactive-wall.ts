/**
 * 互动墙页面 - 展示所有已审核通过的参观反馈
 */

import { getPublicFeedbackList } from '../../utils/api';
import { Feedback } from '../../utils/types';
import { getRelativeTime } from '../../utils/common';

Page({
  data: {
    feedbacks: [] as Feedback[],
    loading: true,
    page: 1,
    pageSize: 10,
    hasMore: true,
    empty: false,
    refreshing: false,
    targetFeedbackId: undefined as string | undefined,
  },

  onLoad(options: any) {
    // 如果从首页点击某个反馈进入，可以滚动到对应位置
    const feedbackId = options.feedbackId;
    if (feedbackId) {
      this.setData({ targetFeedbackId: feedbackId });
    }
    this.loadFeedbacks(true);
  },

  onShow() {
    // 每次显示时刷新列表（可能从反馈页面返回，需要刷新）
    this.setData({ page: 1, hasMore: true });
    this.loadFeedbacks(true);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, refreshing: true });
    this.loadFeedbacks(true, true);
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFeedbacks(false);
    }
  },

  /**
   * 加载反馈列表
   */
  async loadFeedbacks(reset: boolean = false, isRefresh: boolean = false) {
    if (!isRefresh) {
      this.setData({ loading: true });
    }

    try {
      const res = await getPublicFeedbackList({
        page: reset ? 1 : this.data.page,
        pageSize: this.data.pageSize,
      });

      if (res.success && res.data) {
        const feedbacks = res.data.list.map(this.formatFeedbackItem);
        
        this.setData({
          feedbacks: reset ? feedbacks : [...this.data.feedbacks, ...feedbacks],
          page: reset ? 2 : this.data.page + 1,
          hasMore: res.data.list.length >= this.data.pageSize,
          loading: false,
          empty: reset && feedbacks.length === 0,
        });

        // 如果有目标反馈ID，滚动到对应位置
        if (this.data.targetFeedbackId && reset) {
          setTimeout(() => {
            this.scrollToFeedback(this.data.targetFeedbackId);
            this.setData({ targetFeedbackId: undefined });
          }, 500);
        }
      } else {
        throw new Error(res.message || '加载失败');
      }
    } catch (e: any) {
      console.error('加载反馈列表失败', e);
      wx.showToast({
        title: e.message || '加载失败，请重试',
        icon: 'none',
      });
      this.setData({ 
        loading: false,
        empty: reset && this.data.feedbacks.length === 0,
        refreshing: false,
      });
    } finally {
      if (isRefresh) {
        wx.stopPullDownRefresh();
        this.setData({ refreshing: false });
      }
    }
  },

  /**
   * 格式化反馈项
   */
  formatFeedbackItem(feedback: Feedback): any {
    const typeMap: Record<string, string> = {
      visit: '参观体验',
      ar: 'AR体验',
      content: '内容建议',
      other: '其他',
    };

    return {
      ...feedback,
      id: (feedback as any).id?.toString?.() || (feedback as any)._id || '',
      typeText: typeMap[feedback.type] || '其他',
      relativeTime: getRelativeTime(feedback.createdAt),
      formattedDate: new Date(feedback.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  },

  /**
   * 滚动到指定反馈
   */
  scrollToFeedback(feedbackId: string) {
    // 这里可以通过设置scroll-view的scroll-into-view属性来实现
    // 暂时不实现，因为需要给每个反馈项设置id
  },

  /**
   * 点击反馈卡片
   */
  onFeedbackTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    // 可以跳转到反馈详情页，或者展开显示更多内容
    // 暂时不实现详情页，只显示完整内容
  },

  /**
   * 预览图片
   */
  onImageTap(e: WechatMiniprogram.TouchEvent) {
    const { index, images } = e.currentTarget.dataset;
    if (images && images.length > 0) {
      wx.previewImage({
        current: images[index],
        urls: images,
      });
    }
  },

  /**
   * 提交反馈
   */
  onSubmitFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    });
  },
});

