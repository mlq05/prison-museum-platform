/**
 * 开放日设置页面
 */

import { getOpenDaysList, addOpenDay, removeOpenDay, initDefaultOpenDays, checkOpenDay } from '../../utils/api';

Page({
  data: {
    openDays: [] as Array<{
      _id: string;
      type: 'weekday' | 'date';
      weekday?: number;
      date?: string;
      description?: string;
      displayText?: string; // 格式化后的显示文本
    }>,
    loading: false,
    showAddModal: false,
    addForm: {
      type: 'weekday' as 'weekday' | 'date',
      weekday: 5, // 默认周五
      date: '',
      description: '',
    },
    weekdayOptions: [
      { value: 0, label: '周日' },
      { value: 1, label: '周一' },
      { value: 2, label: '周二' },
      { value: 3, label: '周三' },
      { value: 4, label: '周四' },
      { value: 5, label: '周五' },
      { value: 6, label: '周六' },
    ],
  },

  onLoad() {
    this.loadOpenDays();
  },

  /**
   * 加载开放日列表
   */
  async loadOpenDays() {
    this.setData({ loading: true });
    try {
      const res = await getOpenDaysList();
      if (res.success && res.data) {
        // 格式化开放日显示文本
        const formattedOpenDays = res.data.map((item: any) => {
          let displayText = '';
          if (item.type === 'weekday') {
            const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            displayText = `每周${weekdayLabels[item.weekday || 0]}`;
          } else {
            displayText = item.date || '';
          }
          return {
            ...item,
            displayText,
          };
        });
        this.setData({
          openDays: formattedOpenDays,
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
   * 初始化默认开放日（每周五、六）
   */
  async onInitDefault() {
    wx.showModal({
      title: '提示',
      content: '将添加每周五、六为默认开放日，已存在的不会重复添加。确定继续吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '初始化中...' });
            const initRes = await initDefaultOpenDays();
            wx.hideLoading();
            if (initRes.success) {
              wx.showToast({
                title: '初始化成功',
                icon: 'success',
              });
              this.loadOpenDays();
            } else {
              wx.showToast({
                title: initRes.message || '初始化失败',
                icon: 'none',
              });
            }
          } catch (e: any) {
            wx.hideLoading();
            wx.showToast({
              title: e.message || '初始化失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 显示添加弹窗
   */
  showAddModal() {
    this.setData({
      showAddModal: true,
      addForm: {
        type: 'weekday',
        weekday: 5,
        date: '',
        description: '',
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
   * 切换类型
   */
  onTypeChange(e: WechatMiniprogram.Input) {
    this.setData({
      'addForm.type': e.detail.value as 'weekday' | 'date',
    });
  },

  /**
   * 选择星期几
   */
  onWeekdayChange(e: WechatMiniprogram.PickerChange) {
    this.setData({
      'addForm.weekday': parseInt(e.detail.value as string),
    });
  },

  /**
   * 选择日期
   */
  onDateChange(e: WechatMiniprogram.Input) {
    this.setData({
      'addForm.date': e.detail.value,
    });
  },

  /**
   * 输入描述
   */
  onDescriptionInput(e: WechatMiniprogram.Input) {
    this.setData({
      'addForm.description': e.detail.value,
    });
  },

  /**
   * 提交添加
   */
  async onSubmitAdd() {
    const { type, weekday, date, description } = this.data.addForm;

    if (type === 'weekday' && weekday === undefined) {
      wx.showToast({
        title: '请选择星期几',
        icon: 'none',
      });
      return;
    }

    if (type === 'date' && !date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
      });
      return;
    }

    try {
      wx.showLoading({ title: '添加中...' });
      const res = await addOpenDay({
        type,
        weekday: type === 'weekday' ? weekday : undefined,
        date: type === 'date' ? date : undefined,
        description,
      });
      wx.hideLoading();

      if (res.success) {
        wx.showToast({
          title: '添加成功',
          icon: 'success',
        });
        this.hideAddModal();
        this.loadOpenDays();
      } else {
        wx.showToast({
          title: res.message || '添加失败',
          icon: 'none',
        });
      }
    } catch (e: any) {
      wx.hideLoading();
      wx.showToast({
        title: e.message || '添加失败',
        icon: 'none',
      });
    }
  },

  /**
   * 删除开放日
   */
  async onDelete(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个开放日吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            const deleteRes = await removeOpenDay(id);
            wx.hideLoading();

            if (deleteRes.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
              });
              this.loadOpenDays();
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

});

