/**
 * ar-xr.ts - 使用xr-frame实现AR（支持Hiro marker识别和3D模型显示）
 * 适用于小程序，支持个人主体
 */

Page({
  data: {
    // AR状态
    markerDetected: false,
    sceneReady: false,
    arReady: false,
    assetsLoaded: false,
    cameraAuthorized: false, // 摄像头权限状态
    error: '',
    
    // 3D模型配置
    modelUrl: '', // GLB/GLTF模型URL，留空则显示默认几何体
    modelScale: '0.5 0.5 0.5', // 模型缩放
    
    // 动画控制
    animationPaused: false,
    
    // 当前展区信息
    currentHall: null as any,
    hallTitle: '', // 展区标题（显示在AR场景中）
    hallDescription: '', // 展区描述（显示在AR场景中）
    
    // xr-scene实例
    scene: null as any,
  },

  onLoad(options: { hallId?: string; modelUrl?: string }) {
    console.log('AR XR页面加载', options);
    
    // 从参数获取模型URL
    if (options.modelUrl) {
      this.setData({ modelUrl: options.modelUrl });
    }
    
    // 如果有hallId，加载展区信息
    if (options.hallId) {
      this.loadHallInfo(options.hallId);
    }
    
    // 检查基础库版本
    this.checkBaselineVersion();
    
    // 先请求摄像头权限，权限授权后再初始化AR场景
    this.requestCameraPermissionAndInit();
  },
  
  /**
   * 请求摄像头权限并初始化AR场景
   */
  requestCameraPermissionAndInit() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === true) {
          // 已授权，直接初始化
          console.log('摄像头权限已授权，初始化AR场景');
          this.setData({ cameraAuthorized: true });
          this.initARScene();
        } else if (res.authSetting['scope.camera'] === false) {
          // 用户之前拒绝了权限，引导用户去设置页面
          this.setData({
            error: '需要摄像头权限\n\nAR功能需要使用摄像头识别marker，请在设置中开启摄像头权限'
          });
          wx.showModal({
            title: '需要摄像头权限',
            content: 'AR功能需要使用摄像头识别marker，请在设置中开启摄像头权限',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          console.log('摄像头权限已开启，初始化AR场景');
                          this.setData({ error: '', cameraAuthorized: true });
                          this.initARScene();
                        }
                      },
                });
              }
            },
          });
        } else {
          // 还未请求过权限，主动请求
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('摄像头权限授权成功，初始化AR场景');
              this.setData({ cameraAuthorized: true });
              this.initARScene();
            },
            fail: () => {
              console.warn('摄像头权限授权失败');
              this.setData({
                error: '需要摄像头权限\n\nAR功能需要使用摄像头识别marker，请在设置中开启摄像头权限'
              });
              wx.showModal({
                title: '需要摄像头权限',
                content: 'AR功能需要使用摄像头识别marker，请在设置中开启摄像头权限',
                confirmText: '去设置',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          console.log('摄像头权限已开启，初始化AR场景');
                          this.setData({ error: '', cameraAuthorized: true });
                          this.initARScene();
                        }
                      },
                    });
                  }
                },
              });
            },
          });
        }
      },
      fail: () => {
        console.warn('获取权限设置失败，尝试直接初始化');
        // 如果获取权限设置失败，尝试直接初始化（某些情况下可能仍然可以工作）
        this.initARScene();
      },
    });
  },
  
  /**
   * 初始化AR场景
   */
  initARScene() {
    // 延迟检查组件是否可用（给组件加载一些时间）
    setTimeout(() => {
      this.checkComponentAvailability();
    }, 500);
  },
  
  
  /**
   * 检查组件是否可用
   */
  checkComponentAvailability() {
    // 尝试获取场景实例，如果获取不到说明组件可能有问题
    const query = wx.createSelectorQuery();
    query.select('#xr-scene').boundingClientRect((rect) => {
      if (!rect) {
        console.warn('xr-scene组件可能未正确加载');
        // 不直接设置错误，因为可能是正常加载延迟
      }
    }).exec();
  },

  onUnload() {
    // 清理资源
    if (this.data.scene) {
      this.data.scene = null;
    }
  },

  /**
   * 检查基础库版本
   */
  checkBaselineVersion() {
    const systemInfo = wx.getSystemInfoSync();
    console.log('系统信息:', systemInfo);
    
    const SDKVersion = systemInfo.SDKVersion || '';
    const version = SDKVersion.split('.').map(Number);
    
    // 需要基础库 >= 2.27.1
    if (version.length >= 2) {
      const major = version[0];
      const minor = version[1];
      const patch = version[2] || 0;
      
      if (major < 2 || (major === 2 && minor < 27) || (major === 2 && minor === 27 && patch < 1)) {
        this.setData({
          error: `基础库版本过低（当前：${SDKVersion}，需要：≥2.27.1）\n\n请在微信开发者工具中升级基础库版本，或提示用户更新微信版本。`
        });
      }
    }
  },

  /**
   * 加载展区信息
   */
  loadHallInfo(hallId: string) {
    // TODO: 从API或本地数据加载展区信息
    const halls = [
      {
        id: '1',
        name: '民国监狱展区',
        description: '3D复原民国监狱值班室、改造工具等场景',
        modelUrl: '', // 如果有3D模型，填写URL
        modelScale: '0.5 0.5 0.5',
      },
      {
        id: '2',
        name: '新中国监狱展区',
        description: '展示新中国监狱制度发展历程',
        modelUrl: '',
        modelScale: '0.5 0.5 0.5',
      },
    ];
    
    const hall = halls.find(h => h.id === hallId);
    if (hall) {
      this.setData({
        currentHall: hall,
        modelUrl: hall.modelUrl || '',
        modelScale: hall.modelScale || '0.5 0.5 0.5',
        hallTitle: hall.name || '', // 设置展区标题
        hallDescription: hall.description || '', // 设置展区描述
      });
    } else {
      // 如果没有找到展区，设置默认值
      this.setData({
        hallTitle: '监狱历史文化展览馆',
        hallDescription: '探索历史，传承文化',
      });
    }
  },

  /**
   * 场景准备就绪
   */
  onSceneReady(e: any) {
    console.log('XR场景准备就绪', e.detail);
    const scene = e.detail.value;
    this.setData({
      sceneReady: true,
      scene: scene,
    });
    
    // 标记已使用过AR功能
    wx.setStorageSync('ar_has_used', true);
    
    // 尝试启动AR摄像头
    if (scene && typeof scene.startAR === 'function') {
      try {
        scene.startAR();
        console.log('AR摄像头启动命令已发送');
      } catch (err) {
        console.warn('启动AR摄像头失败:', err);
      }
    }
  },

  /**
   * AR系统准备就绪
   */
  onARReady(e: any) {
    console.log('AR系统准备就绪', e.detail);
    console.log('AR系统详情:', JSON.stringify(e.detail));
    this.setData({
      arReady: true,
    });
    
    // 确保摄像头已启动
    if (this.data.scene) {
      try {
        // 尝试启动AR摄像头
        const scene = this.data.scene;
        if (scene.startAR) {
          scene.startAR();
          console.log('AR摄像头已启动');
        }
      } catch (err) {
        console.warn('启动AR摄像头失败:', err);
      }
    }
  },

  /**
   * 资源加载进度
   */
  onAssetsProgress(e: any) {
    console.log('资源加载进度', e.detail);
  },

  /**
   * 场景错误
   */
  onSceneError(e: any) {
    console.error('XR场景错误', e.detail);
    this.setData({
      error: e.detail?.message || 'AR场景初始化失败，请检查设备是否支持AR功能',
    });
  },

  /**
   * 资源加载完成
   */
  onAssetsLoaded(e: any) {
    console.log('XR资源加载完成', e.detail);
    this.setData({ assetsLoaded: true });
    
    wx.showToast({
      title: 'AR资源加载完成',
      icon: 'success',
      duration: 1500,
    });
  },

  /**
   * Marker识别成功
   */
  onMarkerFound(e: any) {
    console.log('Marker识别成功', e.detail);
    this.setData({ markerDetected: true });
    
    wx.showToast({
      title: '识别成功！',
      icon: 'success',
      duration: 1000,
    });
    
    // 通知小程序
    this.notifyMiniProgram('marker_found', {
      hallId: this.data.currentHall?.id || '',
    });
  },

  /**
   * Marker丢失
   */
  onMarkerLost(e: any) {
    console.log('Marker丢失', e.detail);
    this.setData({ markerDetected: false });
  },

  /**
   * 模型点击事件
   */
  onModelTap(e: any) {
    console.log('3D模型被点击', e.detail);
    
    // 可以添加交互效果，比如改变颜色
    wx.showToast({
      title: '点击了3D模型',
      icon: 'none',
      duration: 1500,
    });
  },

  /**
   * 立方体点击事件
   */
  onCubeTap(e: any) {
    console.log('立方体被点击', e.detail);
    
    // 改变颜色
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 注意：xr-frame的材质修改需要通过scene实例操作
    // 这里仅做示例，实际实现可能需要调整
    wx.showToast({
      title: '点击了立方体',
      icon: 'none',
      duration: 1000,
    });
  },

  /**
   * 显示Marker指南
   */
  showMarkerGuide() {
    wx.showModal({
      title: 'Hiro Marker',
      content: 'Hiro marker是AR.js默认提供的识别图案。\n\n你可以：\n1. 访问在线查看：https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg\n2. 打印或显示在另一个设备屏幕上\n3. 将marker对准摄像头进行识别',
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  /**
   * 重置场景
   */
  resetScene() {
    // 重置状态
    this.setData({
      markerDetected: false,
      animationPaused: false,
    });
    
    wx.showToast({
      title: '场景已重置',
      icon: 'success',
      duration: 1000,
    });
  },

  /**
   * 切换动画
   */
  toggleAnimation() {
    this.setData({
      animationPaused: !this.data.animationPaused,
    });
    
    // 注意：xr-frame的动画控制需要通过scene实例操作
    // 这里仅做UI状态切换
    wx.showToast({
      title: this.data.animationPaused ? '动画已播放' : '动画已暂停',
      icon: 'none',
      duration: 1000,
    });
  },

  /**
   * 重试初始化
   */
  retryInit() {
    this.setData({ error: '' });
    // 重新加载页面
    wx.reLaunch({
      url: '/pages/ar-xr/ar-xr',
    });
  },

  /**
   * 关闭AR
   */
  closeAR() {
    wx.navigateBack();
  },

  /**
   * 通知小程序（如果从其他页面跳转过来）
   */
  notifyMiniProgram(type: string, data: any) {
    // 可以在这里添加事件通知逻辑
    console.log('通知小程序:', type, data);
  },
});

