/**
 * 证书相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * 获取证书列表
 */
router.get('/list', (req, res) => {
  const userId = req.user.openId || req.user.userId;

  db.all(
    'SELECT * FROM certificates WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('查询证书列表失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      res.json({
        success: true,
        data: rows
      });
    }
  );
});

/**
 * 生成证书
 */
router.post('/generate', (req, res) => {
  const userId = req.user.openId || req.user.userId;
  const userName = req.user.nickName || req.user.userName || '游客';
  const { type, title, content, gameScore, gameTotalScore, arCheckInCount } = req.body;

  if (!type || !title || !content) {
    return res.status(400).json({
      success: false,
      message: '参数不完整'
    });
  }

  // 生成证书编号
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // 格式化颁发日期
  const issueDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const createdAt = Date.now();

  // 插入证书到数据库
  db.run(
    `INSERT INTO certificates (
      userId, userName, type, title, content, 
      arCheckInCount, gameScore, gameTotalScore, 
      issueDate, certificateNumber, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, userName, type, title, content,
      arCheckInCount || null, gameScore || null, gameTotalScore || null,
      issueDate, certificateNumber, createdAt
    ],
    function(err) {
      if (err) {
        console.error('生成证书失败:', err);
        return res.status(500).json({
          success: false,
          message: '生成证书失败'
        });
      }

      // 处理 lastID 可能为 undefined 的情况
      const lastID = (this && typeof this.lastID !== 'undefined') ? this.lastID : null;
      const certificateId = lastID || Date.now();

      res.json({
        success: true,
        message: '证书生成成功',
        data: {
          id: certificateId,
          certificateId: certificateId,
          certificateNumber,
          issueDate
        }
      });
    }
  );
});

/**
 * 获取证书详情
 */
router.get('/detail', (req, res) => {
  const userId = req.user.openId || req.user.userId;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '证书ID不能为空'
    });
  }

  db.get(
    'SELECT * FROM certificates WHERE id = ? AND userId = ?',
    [id, userId],
    (err, row) => {
      if (err) {
        console.error('查询证书详情失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: '证书不存在'
        });
      }

      res.json({
        success: true,
        data: row
      });
    }
  );
});

module.exports = router;

