/**
 * 反馈相关路由
 */

const express = require('express');
const router = express.Router();
const { db, collections } = require('../db/database');
const { authenticate } = require('../middleware/auth');

/**
 * 提交反馈
 */
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { bookingId, type, content, images, rating, arRating } = req.body;
    const userId = req.user.openId || req.user.userId;
    const userName = req.user.name || '';

    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: '反馈类型和内容不能为空'
      });
    }

    // 使用云数据库API创建反馈
    await collections.feedbacks.create({
      userId,
      userName,
      bookingId: bookingId || null,
      type,
      content,
      images: images || null,
      rating: rating || null,
      arRating: arRating || null,
    });

    res.json({
      success: true,
      message: '反馈提交成功'
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '提交失败'
    });
  }
});

/**
 * 获取反馈列表（需要认证，返回当前用户的反馈）
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user.openId || req.user.userId;

    // 使用云数据库API查询用户反馈列表
    const feedbacks = await collections.feedbacks.listByUser(userId);

    res.json({
      success: true,
      data: feedbacks.map(feedback => ({
        ...feedback,
        images: Array.isArray(feedback.images) ? feedback.images : (feedback.images ? JSON.parse(feedback.images) : [])
      }))
    });
  } catch (error) {
    console.error('查询反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

/**
 * 脱敏用户名（保留姓氏，其他用*代替）
 */
function maskUserName(userName) {
  if (!userName || userName.length === 0) {
    return '匿名用户';
  }
  if (userName.length === 1) {
    return userName + '**';
  }
  if (userName.length === 2) {
    return userName[0] + '*';
  }
  return userName[0] + '*'.repeat(userName.length - 1);
}

/**
 * 获取公开反馈列表（互动墙使用，无需认证，只返回已审核通过的反馈）
 * 支持分页查询
 */
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // 使用云数据库API查询公开反馈列表
    const result = await collections.feedbacks.listPublic({
      page,
      pageSize,
    });

    res.json({
      success: true,
      data: {
        list: result.list.map(feedback => ({
          _id: feedback._id,
          id: feedback._id,
          userName: feedback.userName ? maskUserName(feedback.userName) : '匿名用户',
          content: feedback.content,
          images: Array.isArray(feedback.images) ? feedback.images : (feedback.images ? JSON.parse(feedback.images) : []),
          rating: feedback.rating || 0,
          arRating: feedback.arRating || null,
          type: feedback.type,
          createdAt: feedback.createdAt
        })),
        total: result.total || 0,
        page: result.page,
        pageSize: result.pageSize
      }
    });
  } catch (error) {
    console.error('查询公开反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

module.exports = router;

