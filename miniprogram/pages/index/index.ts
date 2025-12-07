/**
 * 首页 - 中国监狱历史文化展览馆智慧预约平台
 */

const app = getApp<IAppOption>();

Page({
  data: {
    // 轮播图
    // 图片路径：/assets/images/banner1.jpg, banner2.jpg, banner3.jpg
    // 如果图片不存在，会显示纯色背景（bgColor）
    banners: [
      {
        id: 1,
        image: '/assets/images/banner1.jpg', // 第一张轮播图
        title: '探索监狱历史文化',
        subtitle: '沉浸式AR体验，让历史活起来',
        bgColor: '#1A365D', // 图片不存在时的背景色
      },
      {
        id: 2,
        image: '/assets/images/banner2.jpg', // 第二张轮播图
        title: '智慧预约系统',
        subtitle: '一键预约，便捷参观',
        bgColor: '#409EFF',
      },
      {
        id: 3,
        image: '/assets/images/banner3.jpg', // 第三张轮播图
        title: '法治文化传承',
        subtitle: '传播法治精神，弘扬正能量',
        bgColor: '#67C23A',
      },
    ],
    // 快速入口
    quickActions: [
      {
        id: 'booking',
        title: '立即预约',
        icon: '/assets/icons/tab-booking.png', // 使用已存在的图标
        path: '/pages/booking/booking',
        color: '#1A365D',
      },
      {
        id: 'ar',
        title: 'AR体验',
        icon: '/assets/icons/tab-ar.png', // 使用已存在的图标
        path: '/pages/ar-experience/ar-experience',
        color: '#409EFF',
      },
      {
        id: 'halls',
        title: '展馆导览',
        icon: '/assets/icons/tab-home.png', // 使用已存在的图标作为占位
        path: '/pages/exhibition-halls/exhibition-halls',
        color: '#E6A23C',
      },
      {
        id: 'game',
        title: '知识闯关',
        icon: '/assets/icons/tab-my.png', // 使用已存在的图标作为占位
        path: '/pages/knowledge-game/knowledge-game',
        color: '#67C23A',
      },
    ],
    // 展馆介绍
    exhibitionInfo: {
      title: '中国监狱历史文化展览馆',
      description: '探索中国监狱制度的历史演变，了解法治建设的进程，传承优秀法治文化。',
      features: [
        '丰富的历史文物展品',
        '沉浸式AR互动体验',
        '专业语音导览服务',
        '智能化预约管理系统',
      ],
    },
    // 热门展区（前6个）
    hotHalls: [
      {
        id: '1',
        name: '民国监狱展区',
        description: '展示民国时期监狱制度与改造设施，了解历史变迁',
        coverImage: '',
        arEnabled: true,
        bgColor: '#1A365D',
        visitCount: 1234,
      },
      {
        id: '2',
        name: '新中国监狱展区',
        description: '了解新中国监狱制度的发展历程与成就',
        coverImage: '',
        arEnabled: true,
        bgColor: '#409EFF',
        visitCount: 987,
      },
      {
        id: '3',
        name: '法治文化展区',
        description: '传播法治精神，弘扬正能量，传承优秀文化',
        coverImage: '',
        arEnabled: false,
        bgColor: '#67C23A',
        visitCount: 856,
      },
      {
        id: '4',
        name: '古代监狱制度展区',
        description: '探索中国古代监狱制度的起源与发展',
        coverImage: '',
        arEnabled: true,
        bgColor: '#E6A23C',
        visitCount: 654,
      },
      {
        id: '5',
        name: '现代改造教育展区',
        description: '展示现代监狱改造教育理念与实践成果',
        coverImage: '',
        arEnabled: false,
        bgColor: '#909399',
        visitCount: 543,
      },
      {
        id: '6',
        name: '国际监狱制度展区',
        description: '了解世界各国监狱制度的发展与比较',
        coverImage: '',
        arEnabled: true,
        bgColor: '#F56C6C',
        visitCount: 432,
      },
    ] as any[],
    // 互动墙精选
    featuredFeedbacks: [] as any[],
    // 展馆轮播图
    hallBanners: [
      {
        id: 1,
        image: '/assets/images/halls/ancient-prison.jpg',
        title: '古代监狱',
        subtitle: '探索中国古代监狱制度的起源与发展',
        bgColor: '#8B4513',
      },
      {
        id: 2,
        image: '/assets/images/halls/modern-reform.jpg',
        title: '近代狱制改良',
        subtitle: '了解清末至民国时期监狱制度的系统性变革',
        bgColor: '#4169E1',
      },
      {
        id: 3,
        image: '/assets/images/halls/revolutionary-base.jpg',
        title: '革命根据地时期的监狱',
        subtitle: '了解中国共产党领导下的新型司法体制',
        bgColor: '#DC143C',
      },
      {
        id: 4,
        image: '/assets/images/halls/new-china-labor.jpg',
        title: '新中国劳改工作的开创与发展',
        subtitle: '了解具有中国特色的社会主义劳改制度',
        bgColor: '#FF6347',
      },
      {
        id: 5,
        image: '/assets/images/halls/reform-opening.jpg',
        title: '改革开放与社会主义建设时期',
        subtitle: '了解监狱系统的全面转型与创新',
        bgColor: '#32CD32',
      },
    ] as any[],
    // 统计数据（初始值）
    statistics: {
      totalVisitors: 12345,
      totalHalls: 8,
      arUsageCount: 5678,
    },
    // 加载状态
    loading: false, // 初始数据已设置，不需要加载
    // scroll-view 高度
    scrollHeight: '550px', // 默认高度
  },

  onLoad() {
    console.log('首页加载');
    
    // 获取系统信息，动态设置 scroll-view 高度
    const systemInfo = wx.getSystemInfoSync();
    const windowHeight = systemInfo.windowHeight;
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    // 导航栏高度：44px (iOS) 或 48px (Android) + safe-area-inset-top
    const navBarBaseHeight = systemInfo.platform === 'android' ? 48 : 44;
    const navBarHeight = navBarBaseHeight + statusBarHeight;
    // tabBar 高度：约 50px + safe-area-inset-bottom
    const tabBarBaseHeight = 50;
    const safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0;
    const tabBarHeight = tabBarBaseHeight + safeAreaBottom;
    
    // 计算可用高度，留出一些余量确保可以滚动到底部
    const scrollHeight = windowHeight - navBarHeight - tabBarHeight;
    
    console.log('系统信息:', {
      windowHeight,
      statusBarHeight,
      navBarHeight,
      tabBarHeight,
      safeAreaBottom,
      scrollHeight,
    });
    
    // 设置 scroll-view 高度
    this.setData({
      scrollHeight: scrollHeight + 'px',
    });
    
    this.initPage();
  },

  onShow() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 初始化页面
   */
  async initPage() {
    // 数据已在 data 中初始化，不需要加载状态
    // 如果需要从 API 加载数据，可以取消下面的注释
    // this.setData({ loading: true });
    try {
      // 确保数据已设置（虽然已在 data 中初始化）
      console.log('首页数据:', {
        banners: this.data.banners,
        hotHalls: this.data.hotHalls,
        statistics: this.data.statistics,
      });
      
      // 从 API 加载数据
      await Promise.all([
        this.loadHotHalls(),
        this.loadFeaturedFeedbacks(),
        this.loadStatistics(),
      ]);
    } catch (e) {
      console.error('初始化失败', e);
    } finally {
      // this.setData({ loading: false });
    }
  },

  /**
   * 加载热门展区
   */
  async loadHotHalls() {
    try {
      // 尝试从API获取热门展区
      // 注意：微信小程序不支持动态import，改为静态导入
      const { getHallList } = require('../../utils/api');
      const res = await getHallList();
      
      if (res.success && res.data && res.data.length > 0) {
        // 转换API数据格式，取前6个作为热门展区
        const halls = res.data.slice(0, 6).map((hall: any) => ({
          id: String(hall.id),
          name: hall.name || '',
          description: hall.description || '',
          coverImage: hall.coverImage || '',
          // 根据arMarkerImage或arModelUrl判断是否支持AR
          arEnabled: !!(hall.arMarkerImage || hall.arModelUrl),
          bgColor: this.getHallBgColor(hall.id),
          visitCount: hall.visitCount || Math.floor(Math.random() * 2000) + 100, // 如果没有访问量数据，使用随机数
        }));
        
        this.setData({ hotHalls: halls });
        console.log('热门展区数据已从API加载', halls);
      } else {
        // API返回空数据，使用初始化的数据
        console.log('API返回空数据，使用初始化的热门展区数据', this.data.hotHalls);
      }
    } catch (error) {
      // API调用失败，使用初始化的数据
      console.warn('获取热门展区失败，使用初始数据', error);
    }
  },

  /**
   * 根据展区ID获取背景色
   */
  getHallBgColor(id: string | number): string {
    const colors = ['#1A365D', '#409EFF', '#67C23A', '#E6A23C', '#909399', '#F56C6C'];
    const index = Number(id) % colors.length;
    return colors[index] || '#1A365D';
  },

  /**
   * 加载精选反馈
   */
  async loadFeaturedFeedbacks() {
    // TODO: 调用API获取精选反馈
    // 模拟数据
    const featuredFeedbacks = [
      {
        id: '1',
        userName: '张**',
        content: 'AR体验非常震撼，历史场景还原度很高！',
        images: ['/assets/images/feedback1.jpg'],
        rating: 5,
        createdAt: Date.now() - 3600000,
      },
      {
        id: '2',
        userName: '李**',
        content: '展馆内容丰富，预约流程很顺畅。',
        images: [],
        rating: 5,
        createdAt: Date.now() - 7200000,
      },
    ];
    this.setData({ featuredFeedbacks });
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    // TODO: 调用API获取统计数据
    // 模拟数据
    const statistics = {
      totalVisitors: 12345,
      totalHalls: 8,
      arUsageCount: 5678,
    };
    this.setData({ statistics });
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    const isLoggedIn = await app.checkLogin();
    if (!isLoggedIn) {
      // 未登录，可以显示登录提示
      console.log('用户未登录');
    }
  },

  /**
   * 加载数据
   */
  async loadData() {
    await this.initPage();
  },

  /**
   * 点击快速入口
   */
  onQuickActionTap(e: WechatMiniprogram.TouchEvent) {
    const { path } = e.currentTarget.dataset;
    if (path) {
      wx.navigateTo({
        url: path,
      });
    }
  },

  /**
   * 点击热门展区
   */
  onHallTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/exhibition-halls/detail?id=${id}`,
    });
  },

  /**
   * 点击反馈卡片
   */
  onFeedbackTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/interactive-wall/interactive-wall?feedbackId=${id}`,
    });
  },

  /**
   * 查看更多反馈
   */
  onViewMoreFeedbacks() {
    wx.navigateTo({
      url: '/pages/interactive-wall/interactive-wall',
    });
  },

  /**
   * 查看更多展区
   */
  onViewMoreHalls() {
    wx.navigateTo({
      url: '/pages/exhibition-halls/exhibition-halls',
    });
  },

  /**
   * 立即预约
   */
  onBookingTap() {
    wx.navigateTo({
      url: '/pages/booking/booking',
    });
  },

  /**
   * AR体验
   */
  onARTap() {
    wx.navigateTo({
      url: '/pages/ar-experience/ar-experience',
    });
  },
});
