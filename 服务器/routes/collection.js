/**
 * 收藏相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * 添加收藏
 */
router.post('/add', (req, res) => {
  const { type, itemId, itemData } = req.body;
  const userId = req.user.openId || req.user.userId;

  if (!type || !itemId) {
    return res.status(400).json({
      success: false,
      message: '参数不完整'
    });
  }

  // 检查是否已收藏
  db.get(
    'SELECT * FROM collections WHERE userId = ? AND type = ? AND itemId = ?',
    [userId, type, itemId],
    (err, existing) => {
      if (err) {
        console.error('查询收藏失败:', err);
        return res.status(500).json({
          success: false,
          message: '操作失败'
        });
      }

      if (existing) {
        return res.status(400).json({
          success: false,
          message: '已收藏'
        });
      }

      db.run(
        'INSERT INTO collections (userId, type, itemId, itemData, createdAt) VALUES (?, ?, ?, ?, ?)',
        [userId, type, itemId, JSON.stringify(itemData || {}), Date.now()],
        function(err) {
          if (err) {
            console.error('添加收藏失败:', err);
            return res.status(500).json({
              success: false,
              message: '添加失败'
            });
          }

          res.json({
            success: true,
            message: '收藏成功'
          });
        }
      );
    }
  );
});

/**
 * 获取收藏列表
 */
router.get('/list', (req, res) => {
  const userId = req.user.openId || req.user.userId;

  db.all(
    'SELECT * FROM collections WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('查询收藏列表失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      res.json({
        success: true,
        data: rows.map(row => ({
          ...row,
          itemData: row.itemData ? JSON.parse(row.itemData) : {}
        }))
      });
    }
  );
});

/**
 * 取消收藏
 */
router.post('/remove', (req, res) => {
  const { id } = req.body;
  const userId = req.user.openId || req.user.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '收藏ID不能为空'
    });
  }

  db.run(
    'DELETE FROM collections WHERE id = ? AND userId = ?',
    [id, userId],
    function(err) {
      if (err) {
        console.error('取消收藏失败:', err);
        return res.status(500).json({
          success: false,
          message: '取消失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '收藏不存在'
        });
      }

      res.json({
        success: true,
        message: '已取消收藏'
      });
    }
  );
});

module.exports = router;

