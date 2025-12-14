/**
 * 我的收藏页面
 */
Page({
  data: {
    collections: [] as any[],
    loading: false,
  },
  onLoad() {
    this.loadCollections();
  },
  async loadCollections() {
    this.setData({ loading: true });
    try {
      const { getCollectionList } = require('../../utils/api');
      const res = await getCollectionList();
      if (res.success && res.data) {
        this.setData({
          collections: res.data || [],
          loading: false,
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (e) {
      console.error('加载收藏列表失败:', e);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    }
  },
  
  /**
   * 点击收藏项
   */
  onCollectionTap(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.collections[index];
    if (!item) return;

    // 根据类型跳转到对应页面
    if (item.type === 'hall') {
      // 跳转到展区详情
      const itemData = item.itemData || {};
      wx.navigateTo({
        url: `/pages/exhibition-halls/detail?id=${item.itemId}&name=${encodeURIComponent(itemData.name || '展区详情')}`,
      });
    } else if (item.type === 'knowledge') {
      // 跳转到知识闯关（可能需要传递题目信息）
      wx.navigateTo({
        url: '/pages/knowledge-game/knowledge-game',
      });
    } else if (item.type === 'model') {
      // 跳转到AR体验
      wx.navigateTo({
        url: `/pages/ar-xr/ar-xr?hallId=${item.itemId}`,
      });
    }
  },

  /**
   * 删除收藏
   */
  async onDeleteCollection(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.collections[index];
    if (!item || !item._id) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const { removeCollection } = require('../../utils/api');
            const result = await removeCollection(item._id);
            if (result.success) {
              // 从列表中移除
              const collections = [...this.data.collections];
              collections.splice(index, 1);
              this.setData({ collections });
              wx.showToast({
                title: '已取消收藏',
                icon: 'success',
              });
            }
          } catch (e) {
            console.error('删除收藏失败:', e);
            wx.showToast({
              title: '操作失败',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  /**
   * 格式化时间
   */
  getTimeText(timestamp: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  },
});

