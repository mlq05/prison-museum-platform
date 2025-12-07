/**
 * 展区相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * 获取展区列表
 */
router.get('/list', (req, res) => {
  console.log('收到获取展区列表请求');
  
  db.all(
    'SELECT * FROM halls WHERE isActive = 1 ORDER BY order_index ASC, floor ASC',
    [],
    (err, rows) => {
      if (err) {
        console.error('查询展区列表失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败',
          data: []
        });
      }

      // 如果查询返回null或undefined，使用空数组
      const result = rows || [];
      
      console.log('展区列表查询结果:', {
        count: result.length,
        data: result
      });

      res.json({
        success: true,
        data: result,
        message: result.length > 0 ? '' : '暂无展区数据'
      });
    }
  );
});

/**
 * 获取展区详情
 */
router.get('/detail', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '展区ID不能为空'
    });
  }

  db.get('SELECT * FROM halls WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('查询展区详情失败:', err);
      return res.status(500).json({
        success: false,
        message: '查询失败'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: '展区不存在'
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

module.exports = router;

