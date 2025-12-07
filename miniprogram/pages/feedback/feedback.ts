/**
 * 反馈页面 - 提交参观反馈
 */

import { submitFeedback } from '../../utils/api';
import { Feedback } from '../../utils/types';

const app = getApp<IAppOption>();

Page({
  data: {
    // 反馈类型
    feedbackType: 'visit' as 'visit' | 'ar' | 'content' | 'other',
    typeIndex: 0,
    typeOptions: [
      { value: 'visit', label: '参观体验' },
      { value: 'ar', label: 'AR体验' },
      { value: 'content', label: '内容建议' },
      { value: 'other', label: '其他' },
    ],
    // 反馈内容
    content: '',
    // 评分（1-5星）
    rating: 0,
    // AR评分（如果有）
    arRating: 0,
    showARRating: false,
    // 图片列表
    images: [] as string[],
    // 预约ID（可选）
    bookingId: '',
    // 表单验证错误
    errors: {} as Record<string, string>,
    // 提交中
    submitting: false,
    // 是否已显示登录提示
    hasShownLoginModal: false,
  },

  onLoad(options: any) {
    // 如果从预约详情页跳转，可以传入bookingId
    if (options.bookingId) {
      this.setData({ bookingId: options.bookingId });
    }
    
    // 检查登录状态（不强制，允许开发阶段使用）
    this.checkLogin();
  },

  onShow() {
    // 每次显示时检查登录状态（可能从"我的"页面返回，已经登录了）
    this.checkLogin();
  },

  /**
   * 检查登录状态
   */
  async checkLogin() {
    const isLoggedIn = await app.checkLogin();
    // 开发阶段：不强制要求登录，允许继续使用表单
    // 但在提交时会再次检查
    if (!isLoggedIn) {
      // 只在首次加载时提示，避免频繁弹窗
      if (!this.data.hasShownLoginModal) {
        this.setData({ hasShownLoginModal: true });
        wx.showModal({
          title: '提示',
          content: '提交反馈需要登录，您可以在"我的"页面登录。是否现在去登录？',
          showCancel: true,
          cancelText: '稍后',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              // 跳转到登录页面或我的页面
              wx.switchTab({
                url: '/pages/my/my',
              });
            }
            // 如果取消，允许继续使用表单（开发阶段）
          },
        });
      }
    }
  },

  /**
   * 选择反馈类型
   */
  onTypeChange(e: WechatMiniprogram.PickerChange) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedType = this.data.typeOptions[selectedIndex].value;
    this.setData({
      typeIndex: selectedIndex,
      feedbackType: selectedType as any,
      showARRating: selectedType === 'ar',
      errors: {},
    });
  },

  /**
   * 输入反馈内容
   */
  onContentInput(e: WechatMiniprogram.Input) {
    this.setData({
      content: e.detail.value,
      errors: { ...this.data.errors, content: '' },
    });
  },

  /**
   * 选择评分
   */
  onRatingTap(e: WechatMiniprogram.TouchEvent) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({ rating });
  },

  /**
   * 选择AR评分
   */
  onARRatingTap(e: WechatMiniprogram.TouchEvent) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({ arRating: rating });
  },

  /**
   * 选择图片
   */
  async onChooseImage() {
    if (this.data.images.length >= 9) {
      wx.showToast({
        title: '最多只能上传9张图片',
        icon: 'none',
      });
      return;
    }

    try {
      const res = await wx.chooseImage({
        count: 9 - this.data.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      // 这里可以上传到服务器，暂时使用本地路径
      // 实际项目中应该上传到云存储或服务器
      this.setData({
        images: [...this.data.images, ...res.tempFilePaths],
      });
    } catch (e: any) {
      console.error('选择图片失败', e);
      if (e.errMsg !== 'chooseImage:fail cancel') {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      }
    }
  },

  /**
   * 删除图片
   */
  onDeleteImage(e: WechatMiniprogram.TouchEvent) {
    const index = parseInt(e.currentTarget.dataset.index);
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  /**
   * 预览图片
   */
  onPreviewImage(e: WechatMiniprogram.TouchEvent) {
    const index = parseInt(e.currentTarget.dataset.index);
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images,
    });
  },

  /**
   * 验证表单
   */
  validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!this.data.content.trim()) {
      errors.content = '请输入反馈内容';
    } else if (this.data.content.trim().length < 10) {
      errors.content = '反馈内容至少需要10个字符';
    }

    if (this.data.rating === 0) {
      errors.rating = '请选择评分';
    }

    if (this.data.feedbackType === 'ar' && this.data.arRating === 0) {
      errors.arRating = '请选择AR体验评分';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 提交反馈
   */
  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    // 检查登录状态
    const isLoggedIn = await app.checkLogin();
    if (!isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '提交反馈需要登录，请先前往"我的"页面登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
          }
        },
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      // TODO: 上传图片到服务器，获取图片URL
      const imageUrls: string[] = [];
      // 暂时使用空数组，实际项目中需要上传图片

      const res = await submitFeedback({
        bookingId: this.data.bookingId || undefined,
        type: this.data.feedbackType,
        content: this.data.content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        rating: this.data.rating,
        arRating: this.data.feedbackType === 'ar' ? this.data.arRating : undefined,
      });

      if (res.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
        });

        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message || '提交失败');
      }
    } catch (e: any) {
      console.error('提交反馈失败', e);
      wx.showToast({
        title: e.message || '提交失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});

