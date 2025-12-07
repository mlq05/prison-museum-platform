/**
 * 反馈相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

/**
 * 提交反馈
 */
router.post('/submit', authenticate, (req, res) => {
  const { bookingId, type, content, images, rating, arRating } = req.body;
  const userId = req.user.openId || req.user.userId;
  const userName = req.user.name || '';

  if (!type || !content) {
    return res.status(400).json({
      success: false,
      message: '反馈类型和内容不能为空'
    });
  }

  db.run(
    `INSERT INTO feedbacks (
      userId, userName, bookingId, type, content, images, rating, arRating, status, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      userId,
      userName,
      bookingId || null,
      type,
      content,
      images ? JSON.stringify(images) : null,
      rating || null,
      arRating || null,
      Date.now()
    ],
    function(err) {
      if (err) {
        console.error('提交反馈失败:', err);
        return res.status(500).json({
          success: false,
          message: '提交失败'
        });
      }

      res.json({
        success: true,
        message: '反馈提交成功'
      });
    }
  );
});

/**
 * 获取反馈列表（需要认证，返回当前用户的反馈）
 */
router.get('/list', authenticate, (req, res) => {
  const userId = req.user.openId || req.user.userId;

  db.all(
    'SELECT * FROM feedbacks WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('查询反馈列表失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      res.json({
        success: true,
        data: rows.map(row => ({
          ...row,
          images: row.images ? JSON.parse(row.images) : []
        }))
      });
    }
  );
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
router.get('/public', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  // 查询总数
  db.get(
    'SELECT COUNT(*) as total FROM feedbacks WHERE status = ?',
    ['approved'],
    (err, countResult) => {
      if (err) {
        console.error('查询反馈总数失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      const total = countResult.total || 0;

      // 查询列表
      db.all(
        `SELECT id, userName, content, images, rating, arRating, type, createdAt 
         FROM feedbacks 
         WHERE status = ? 
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        ['approved', pageSize, offset],
        (err, rows) => {
          if (err) {
            console.error('查询反馈列表失败:', err);
            return res.status(500).json({
              success: false,
              message: '查询失败'
            });
          }

          res.json({
            success: true,
            data: {
              list: rows.map(row => ({
                id: row.id,
                userName: row.userName ? maskUserName(row.userName) : '匿名用户',
                content: row.content,
                images: row.images ? JSON.parse(row.images) : [],
                rating: row.rating || 0,
                arRating: row.arRating || null,
                type: row.type,
                createdAt: row.createdAt
              })),
              total,
              page,
              pageSize
            }
          });
        }
      );
    }
  );
});

module.exports = router;

