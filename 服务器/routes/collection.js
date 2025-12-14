/**
 * 收藏相关路由
 */

const express = require('express');
const router = express.Router();
const { collections } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * 添加收藏
 */
router.post('/add', async (req, res) => {
  try {
    const { type, itemId, itemData } = req.body;
    const userId = req.user.openId || req.user.userId;

    if (!type || !itemId) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    // 检查是否已收藏
    const existing = await collections.collections.checkExists(userId, type, itemId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '已收藏'
      });
    }

    // 创建收藏
    await collections.collections.create({
      userId,
      type,
      itemId,
      itemData: itemData || {},
    });

    res.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '添加失败'
    });
  }
});

/**
 * 获取收藏列表
 */
router.get('/list', async (req, res) => {
  try {
    const userId = req.user.openId || req.user.userId;
    const collectionsList = await collections.collections.listByUser(userId);
    
    res.json({
      success: true,
      data: collectionsList || []
    });
  } catch (error) {
    console.error('查询收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

/**
 * 取消收藏
 */
router.post('/remove', async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.openId || req.user.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '收藏ID不能为空'
      });
    }

    // 验证收藏是否属于当前用户
    const collectionList = await collections.collections.listByUser(userId);
    const collection = collectionList.find((c: any) => c._id === id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在'
      });
    }

    await collections.collections.remove(id);

    res.json({
      success: true,
      message: '已取消收藏'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消失败'
    });
  }
});

module.exports = router;

