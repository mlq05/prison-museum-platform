/**
 * 公告管理页面
 */

import { getAdminAnnouncementsList, createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement } from '../../utils/api';
import { formatDate as formatDateUtil } from '../../utils/common';

Page({
  data: {
    announcements: [] as Array<{
      _id: string;
      title: string;
      summary: string;
      content: string;
      status: 'draft' | 'published';
      publishAt: number | null;
      expireAt: number | null;
      createdAt: number;
      updatedAt: number;
    }>,
    loading: false,
    statusFilter: 'all' as 'all' | 'draft' | 'published',
    showAddModal: false,
    showEditModal: false,
    editingAnnouncement: null as any,
    form: {
      title: '',
      content: '',
      summary: '',
      status: 'draft' as 'draft' | 'published',
      expireAt: '',
    },
  },

  onLoad() {
    this.loadAnnouncements();
  },

  onShow() {
    // 每次显示页面时刷新列表
    this.loadAnnouncements();
  },

  /**
   * 加载公告列表
   */
  async loadAnnouncements() {
    this.setData({ loading: true });
    try {
      const res = await getAdminAnnouncementsList({
        page: 1,
        pageSize: 100,
        status: this.data.statusFilter === 'all' ? undefined : this.data.statusFilter,
      });
      if (res.success && res.data) {
        this.setData({
          announcements: res.data,
        });
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none',
        });
      }
    } catch (e: any) {
      wx.showToast({
        title: e.message || '加载失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 切换状态筛选
   */
  onStatusFilterChange(e: WechatMiniprogram.TouchEvent) {
    const { status } = e.currentTarget.dataset;
    this.setData({ statusFilter: status });
    this.loadAnnouncements();
  },

  /**
   * 显示添加弹窗
   */
  showAddModal() {
    this.setData({
      showAddModal: true,
      form: {
        title: '',
        content: '',
        summary: '',
        status: 'draft',
        expireAt: '',
      },
    });
  },

  /**
   * 隐藏添加弹窗
   */
  hideAddModal() {
    this.setData({ showAddModal: false });
  },

  /**
   * 阻止事件冒泡（用于弹窗内容区域）
   */
  stopPropagation() {
    // 阻止点击弹窗内容区域关闭弹窗
  },

  /**
   * 显示编辑弹窗
   */
  showEditModal(e: WechatMiniprogram.TouchEvent) {
    const announcement = e.currentTarget.dataset.announcement;
    if (!announcement) return;
    
    this.setData({
      showEditModal: true,
      editingAnnouncement: announcement,
      form: {
        title: announcement.title,
        content: announcement.content,
        summary: announcement.summary || '',
        status: announcement.status,
        expireAt: announcement.expireAt ? formatDate(new Date(announcement.expireAt), 'YYYY-MM-DD') : '',
      },
    });
  },

  /**
   * 隐藏编辑弹窗
   */
  hideEditModal() {
    this.setData({ showEditModal: false, editingAnnouncement: null });
  },

  /**
   * 输入标题
   */
  onTitleInput(e: WechatMiniprogram.Input) {
    this.setData({
      'form.title': e.detail.value,
    });
  },

  /**
   * 输入内容
   */
  onContentInput(e: WechatMiniprogram.Input) {
    const content = e.detail.value;
    // 自动生成摘要（如果没有手动输入）
    if (!this.data.form.summary) {
      const summary = content.substring(0, 100);
      this.setData({
        'form.content': content,
        'form.summary': summary,
      });
    } else {
      this.setData({
        'form.content': content,
      });
    }
  },

  /**
   * 输入摘要
   */
  onSummaryInput(e: WechatMiniprogram.Input) {
    this.setData({
      'form.summary': e.detail.value,
    });
  },

  /**
   * 选择状态
   */
  onStatusChange(e: WechatMiniprogram.TouchEvent) {
    const { status } = e.currentTarget.dataset;
    this.setData({
      'form.status': status,
    });
  },

  /**
   * 选择过期日期
   */
  onExpireDateChange(e: WechatMiniprogram.DatePickerChange) {
    this.setData({
      'form.expireAt': e.detail.value,
    });
  },

  /**
   * 提交添加
   */
  async onSubmitAdd() {
    const { title, content, summary, status, expireAt } = this.data.form;

    if (!title || !content) {
      wx.showToast({
        title: '请填写标题和内容',
        icon: 'none',
      });
      return;
    }

    try {
      wx.showLoading({ title: '创建中...' });
      const res = await createAnnouncement({
        title,
        content,
        summary: summary || content.substring(0, 100),
        status,
        expireAt: expireAt || null,
      });
      wx.hideLoading();

      if (res.success) {
        wx.showToast({
          title: '创建成功',
          icon: 'success',
        });
        this.hideAddModal();
        this.loadAnnouncements();
      } else {
        wx.showToast({
          title: res.message || '创建失败',
          icon: 'none',
        });
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '创建失败',
        icon: 'none',
      });
    }
  },

  /**
   * 提交编辑
   */
  async onSubmitEdit() {
    const { editingAnnouncement, form } = this.data;
    if (!editingAnnouncement) return;

    const { title, content, summary, status, expireAt } = form;

    if (!title || !content) {
      wx.showToast({
        title: '请填写标题和内容',
        icon: 'none',
      });
      return;
    }

    try {
      wx.showLoading({ title: '更新中...' });
      const res = await updateAnnouncement(editingAnnouncement._id, {
        title,
        content,
        summary: summary || content.substring(0, 100),
        status,
        expireAt: expireAt || null,
      });
      wx.hideLoading();

      if (res.success) {
        wx.showToast({
          title: '更新成功',
          icon: 'success',
        });
        this.hideEditModal();
        this.loadAnnouncements();
      } else {
        wx.showToast({
          title: res.message || '更新失败',
          icon: 'none',
        });
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '更新失败',
        icon: 'none',
      });
    }
  },

  /**
   * 发布/取消发布
   */
  async onTogglePublish(e: WechatMiniprogram.TouchEvent) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === 'published' ? 'draft' : 'published';

    wx.showModal({
      title: '确认操作',
      content: newStatus === 'published' ? '确定要发布这条公告吗？' : '确定要取消发布这条公告吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: newStatus === 'published' ? '发布中...' : '取消发布中...' });
            const publishRes = await publishAnnouncement(id, newStatus);
            wx.hideLoading();

            if (publishRes.success) {
              wx.showToast({
                title: newStatus === 'published' ? '发布成功' : '已取消发布',
                icon: 'success',
              });
              this.loadAnnouncements();
            } else {
              wx.showToast({
                title: publishRes.message || '操作失败',
                icon: 'none',
              });
            }
          } catch (e: any) {
            wx.hideLoading();
            wx.showToast({
              title: e.message || '操作失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 删除公告
   */
  async onDelete(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条公告吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            const deleteRes = await deleteAnnouncement(id);
            wx.hideLoading();

            if (deleteRes.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
              });
              this.loadAnnouncements();
            } else {
              wx.showToast({
                title: deleteRes.message || '删除失败',
                icon: 'none',
              });
            }
          } catch (e: any) {
            wx.hideLoading();
            wx.showToast({
              title: e.message || '删除失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 格式化日期
   */
  formatDate(timestamp: number | null): string {
    if (!timestamp) return '-';
    return formatDate(new Date(timestamp), 'YYYY-MM-DD HH:mm');
  },
});

