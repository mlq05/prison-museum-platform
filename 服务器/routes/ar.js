/**
 * AR相关路由
 */

const express = require('express');
const router = express.Router();
const { db, collections } = require('../db/database');
const { authenticate } = require('../middleware/auth');

/**
 * AR打卡
 */
router.post('/checkin', authenticate, (req, res) => {
  const { hallId, pointId } = req.body;
  const userId = req.user.openId || req.user.userId;

  if (!hallId || !pointId) {
    return res.status(400).json({
      success: false,
      message: '参数不完整'
    });
  }

  // TODO: 实现打卡逻辑
  res.json({
    success: true,
    message: '打卡成功',
    data: {
      hallId,
      pointId,
      checkInTime: Date.now()
    }
  });
});

/**
 * AR点击统计（记录用户点击AR体验按钮的次数）
 */
router.post('/click', async (req, res) => {
  try {
    const { hallId } = req.body;
    const userId = req.user?.openId || req.user?.userId || 'anonymous';

    if (!hallId) {
      return res.status(400).json({
        success: false,
        message: '展区ID不能为空'
      });
    }

    // 记录AR点击到ar_clicks集合
    const { cloudDb } = require('../db/database');
    if (cloudDb) {
      await cloudDb.collection('ar_clicks').add({
        hallId,
        userId,
        clickTime: Date.now(),
      });
    }

    res.json({
      success: true,
      message: '统计成功'
    });
  } catch (error) {
    console.error('AR点击统计失败:', error);
    // 即使统计失败，也返回成功，避免影响用户体验
    res.json({
      success: true,
      message: '统计成功'
    });
  }
});

module.exports = router;

