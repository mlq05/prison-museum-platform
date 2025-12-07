/**
 * ar-native.ts - 基于小程序原生组件的AR体验页面
 * 适用于个人主体，不使用web-view
 */

Page({
  data: {
    // 摄像头设置
    devicePosition: 'back' as 'front' | 'back',
    flash: 'off' as 'on' | 'off' | 'auto',
    scanning: false,
    markerDetected: false,
    
    // 提示信息
    hintText: '请将摄像头对准展区二维码标识',
    
    // AR内容
    arModelTitle: '',
    arModelDesc: '',
    arModelIcon: '',
    arModelImage: '',
    showResult: false,
    
    // 知识点
    knowledgePoints: [] as any[],
    
    // 语音导览
    audioUrl: '',
    audioTitle: '',
    audioDuration: '00:00',
    audioPlaying: false,
    audioProgress: 0,
    audioContext: null as any,
    
    // 打卡状态
    checkInStatus: 'unchecked' as 'unchecked' | 'checked',
    checkInPointId: '',
    
    // 当前展区信息
    currentHall: null as any,
  },

  onLoad(options: { hallId?: string }) {
    console.log('AR原生页面加载', options);
    
    // 如果有hallId，直接加载展区信息
    if (options.hallId) {
      this.loadHallInfo(options.hallId);
    }
    
    // 检查摄像头权限
    this.checkCameraPermission();
  },

  onUnload() {
    // 停止音频播放
    this.stopAudio();
  },

  /**
   * 检查摄像头权限
   */
  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        const cameraAuth = res.authSetting['scope.camera'];
        
        if (cameraAuth === true) {
          // 已授权，确保摄像头可以正常启动
          console.log('摄像头权限已授权');
          this.ensureCameraReady();
        } else if (cameraAuth === false) {
          // 用户之前拒绝了权限，引导用户去设置页面
          wx.showModal({
            title: '需要摄像头权限',
            content: 'AR功能需要使用摄像头识别二维码，请在设置中开启摄像头权限',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.camera']) {
                      console.log('摄像头权限已开启');
                      this.ensureCameraReady();
                    } else {
                      // 用户仍然没有授权，返回上一页
                      wx.showToast({
                        title: '需要摄像头权限才能使用AR功能',
                        icon: 'none',
                        duration: 2000,
                      });
                      setTimeout(() => {
                        wx.navigateBack();
                      }, 2000);
                    }
                  },
                });
              } else {
                // 用户取消，返回上一页
                wx.navigateBack();
              }
            },
          });
        } else {
          // 还未请求过权限，主动请求
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('摄像头权限授权成功');
              this.ensureCameraReady();
            },
            fail: () => {
              console.warn('摄像头权限授权失败');
              wx.showModal({
                title: '需要摄像头权限',
                content: 'AR功能需要使用摄像头识别二维码，请在设置中开启摄像头权限',
                confirmText: '去设置',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.camera']) {
                          console.log('摄像头权限已开启');
                          this.ensureCameraReady();
                        } else {
                          wx.showToast({
                            title: '需要摄像头权限才能使用AR功能',
                            icon: 'none',
                            duration: 2000,
                          });
                          setTimeout(() => {
                            wx.navigateBack();
                          }, 2000);
                        }
                      },
                    });
                  } else {
                    wx.navigateBack();
                  }
                },
              });
            },
          });
        }
      },
      fail: () => {
        console.warn('获取权限设置失败，尝试直接使用摄像头');
        // 如果获取权限设置失败，尝试直接使用摄像头（某些情况下可能仍然可以工作）
        this.ensureCameraReady();
      },
    });
  },

  /**
   * 确保摄像头准备就绪
   */
  ensureCameraReady() {
    // 延迟一下，确保权限设置生效
    setTimeout(() => {
      // 检查摄像头是否可用
      wx.checkIsSupportSoterAuthentication({
        success: () => {
          console.log('设备支持摄像头功能');
        },
        fail: () => {
          console.warn('设备可能不支持摄像头功能');
        },
      });
      
      // 显示提示信息
      wx.showToast({
        title: '摄像头已就绪',
        icon: 'success',
        duration: 1500,
      });
    }, 300);
  },

  /**
   * 加载展区信息
   */
  async loadHallInfo(hallId: string) {
    // TODO: 从API或本地数据加载展区信息
    // 这里使用模拟数据
    // 实际使用时，建议从服务器API或云数据库加载
    const halls = [
      {
        id: '1',
        name: '民国监狱展区',
        description: '3D复原民国监狱值班室、改造工具等场景',
        icon: '/assets/icons/hall1.png',
        image: '/assets/images/hall1.jpg',
        qrCode: 'hall_001', // 二维码内容
        knowledgePoints: [
          { id: '1', icon: '📚', title: '监狱制度', desc: '了解民国时期的监狱管理制度' },
          { id: '2', icon: '🔧', title: '改造工具', desc: '查看当时的改造工具和设施' },
        ],
        audioUrl: '/assets/audio/hall1.mp3',
        audioTitle: '民国监狱展区导览',
        checkInPointId: 'point1',
      },
      {
        id: '2',
        name: '新中国监狱展区',
        description: '展示新中国监狱制度发展历程',
        icon: '/assets/icons/hall2.png',
        image: '/assets/images/hall2.jpg',
        qrCode: 'hall_002',
        knowledgePoints: [
          { id: '3', icon: '📖', title: '发展历程', desc: '了解新中国监狱制度的发展' },
        ],
        audioUrl: '/assets/audio/hall2.mp3',
        audioTitle: '新中国监狱展区导览',
        checkInPointId: 'point2',
      },
    ];
    
    const hall = halls.find(h => h.id === hallId);
    if (hall) {
      this.setData({ currentHall: hall });
    }
  },

  /**
   * 摄像头扫码识别
   */
  onScanCode(e: WechatMiniprogram.CameraScanCode) {
    console.log('扫码识别:', e.detail);
    const result = e.detail.result || e.detail.scanResult || '';
    
    if (!result) {
      console.warn('二维码内容为空');
      return;
    }
    
    // 如果正在扫描，忽略
    if (this.data.scanning) {
      return;
    }
    
    this.setData({ scanning: true });
    
    // 解析二维码内容
    this.handleQRCode(result);
  },

  /**
   * 处理二维码内容
   */
  handleQRCode(qrCode: string) {
    console.log('处理二维码:', qrCode);
    
    // 解析二维码（格式：hall_001 或 ar:1）
    let hallId = '';
    if (qrCode.startsWith('ar:')) {
      hallId = qrCode.substring(3);
    } else if (qrCode.startsWith('hall_')) {
      // 根据二维码匹配展区
      const hallMap: Record<string, string> = {
        'hall_001': '1',
        'hall_002': '2',
      };
      hallId = hallMap[qrCode] || qrCode.replace('hall_', '');
    } else {
      // 尝试直接作为hallId
      hallId = qrCode;
    }
    
    // 加载展区信息
    this.loadHallInfo(hallId);
    
    // 查找对应的展区
    const hall = this.data.currentHall;
    if (hall) {
      // 识别成功
      this.onMarkerDetected(hall);
    } else {
      wx.showToast({
        title: '未找到对应展区',
        icon: 'none',
      });
      this.setData({ scanning: false });
    }
  },

  /**
   * Marker识别成功
   */
  onMarkerDetected(hall: any) {
    console.log('Marker识别成功:', hall);
    
    // 保存打卡点ID
    const checkInPoints = wx.getStorageSync('ar_checkin_points') || [];
    const isChecked = checkInPoints.includes(hall.checkInPointId);
    
    this.setData({
      markerDetected: true,
      arModelTitle: hall.name,
      arModelDesc: hall.description,
      arModelIcon: hall.icon,
      arModelImage: hall.image,
      knowledgePoints: hall.knowledgePoints || [],
      audioUrl: hall.audioUrl || '',
      audioTitle: hall.audioTitle || '',
      checkInStatus: isChecked ? 'checked' : 'unchecked',
      checkInPointId: hall.checkInPointId,
      scanning: false,
    });
    
    // 延迟显示结果页面
    setTimeout(() => {
      this.setData({ showResult: true });
    }, 1000);
    
    // 标记已使用过AR功能
    wx.setStorageSync('ar_has_used', true);
  },

  /**
   * 手动扫码
   */
  manualScan() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        this.handleQRCode(res.result);
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'none',
        });
      },
    });
  },

  /**
   * 切换摄像头
   */
  switchCamera() {
    const newPosition = this.data.devicePosition === 'back' ? 'front' : 'back';
    this.setData({ devicePosition: newPosition });
    wx.showToast({
      title: `切换到${newPosition === 'back' ? '后置' : '前置'}摄像头`,
      icon: 'none',
      duration: 1500,
    });
  },

  /**
   * 切换闪光灯
   */
  toggleFlash() {
    const flashMap: Record<string, 'on' | 'off' | 'auto'> = {
      'off': 'on',
      'on': 'auto',
      'auto': 'off',
    };
    const newFlash = flashMap[this.data.flash] || 'off';
    this.setData({ flash: newFlash });
  },

  /**
   * 摄像头停止
   */
  onCameraStop() {
    console.log('摄像头停止');
  },

  /**
   * 摄像头错误
   */
  onCameraError(e: WechatMiniprogram.CameraError) {
    console.error('摄像头错误:', e.detail);
    const errorCode = e.detail?.errMsg || '';
    
    // 根据错误类型提供不同的处理方案
    let errorMessage = '无法访问摄像头';
    let showRetry = false;
    
    if (errorCode.includes('permission') || errorCode.includes('权限')) {
      errorMessage = '摄像头权限被拒绝，请在设置中开启摄像头权限';
      showRetry = true;
    } else if (errorCode.includes('busy') || errorCode.includes('占用')) {
      errorMessage = '摄像头被其他应用占用，请关闭其他应用后重试';
      showRetry = true;
    } else if (errorCode.includes('not found') || errorCode.includes('未找到')) {
      errorMessage = '未检测到摄像头设备';
    } else {
      errorMessage = '摄像头初始化失败，请检查设备是否支持摄像头功能';
      showRetry = true;
    }
    
    wx.showModal({
      title: '摄像头错误',
      content: errorMessage,
      confirmText: showRetry ? '重试' : '确定',
      cancelText: showRetry ? '返回' : '',
      showCancel: showRetry,
      success: (res) => {
        if (res.confirm && showRetry) {
          // 重试：重新检查权限并初始化
          this.checkCameraPermission();
        } else if (!res.confirm && showRetry) {
          // 用户选择返回
          wx.navigateBack();
        } else if (!showRetry && (errorCode.includes('permission') || errorCode.includes('权限'))) {
          // 权限问题，引导用户去设置
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.camera']) {
                // 权限已开启，重新初始化
                this.ensureCameraReady();
              }
            },
          });
        }
      },
    });
  },

  /**
   * 点击知识点
   */
  onPointTap(e: WechatMiniprogram.TouchEvent) {
    const point = e.currentTarget.dataset.point;
    wx.showModal({
      title: point.title,
      content: point.desc,
      showCancel: false,
    });
  },

  /**
   * 切换音频播放
   */
  toggleAudio() {
    if (this.data.audioPlaying) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  },

  /**
   * 播放音频
   */
  playAudio() {
    if (!this.data.audioUrl) {
      wx.showToast({
        title: '暂无语音导览',
        icon: 'none',
      });
      return;
    }
    
    // TODO: 实现音频播放
    // 小程序需要使用 wx.createInnerAudioContext()
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.audioUrl;
    audioContext.onPlay(() => {
      this.setData({ audioPlaying: true });
    });
    audioContext.onEnded(() => {
      this.setData({ audioPlaying: false, audioProgress: 0 });
      audioContext.destroy();
    });
    audioContext.onError((err) => {
      console.error('音频播放错误:', err);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none',
      });
      this.setData({ audioPlaying: false });
    });
    
    audioContext.play();
    this.setData({ audioContext });
  },

  /**
   * 停止音频
   */
  stopAudio() {
    if (this.data.audioContext) {
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.setData({
        audioContext: null,
        audioPlaying: false,
        audioProgress: 0,
      });
    }
  },

  /**
   * AR打卡
   */
  onCheckIn() {
    if (this.data.checkInStatus === 'checked') {
      return;
    }
    
    const checkInPoints = wx.getStorageSync('ar_checkin_points') || [];
    if (!checkInPoints.includes(this.data.checkInPointId)) {
      checkInPoints.push(this.data.checkInPointId);
      wx.setStorageSync('ar_checkin_points', checkInPoints);
      
      this.setData({ checkInStatus: 'checked' });
      
      wx.showToast({
        title: '打卡成功！',
        icon: 'success',
      });
      
      // 检查是否完成所有打卡
      this.checkAllCheckInComplete();
    }
  },

  /**
   * 检查是否完成所有打卡
   */
  checkAllCheckInComplete() {
    const checkInPoints = wx.getStorageSync('ar_checkin_points') || [];
    const totalPoints = 3; // TODO: 从配置获取总打卡点数
    
    if (checkInPoints.length >= totalPoints) {
      wx.showModal({
        title: '🎉 恭喜！',
        content: '您已完成所有AR打卡任务，解锁"监狱历史文化传播大使"专属勋章！',
        confirmText: '查看勋章',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/certificate/certificate?type=checkin',
            });
          }
        },
      });
    }
  },

  /**
   * 返回摄像头
   */
  backToCamera() {
    this.setData({
      showResult: false,
      markerDetected: false,
      scanning: false,
    });
  },

  /**
   * 关闭AR
   */
  closeAR() {
    this.stopAudio();
    wx.navigateBack();
  },
});

