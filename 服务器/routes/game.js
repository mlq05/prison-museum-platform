/**
 * 知识闯关相关路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * 开始闯关
 */
router.post('/start', authenticate, (req, res) => {
  // TODO: 实现题目生成逻辑
  res.json({
    success: true,
    data: {
      questions: []
    }
  });
});

/**
 * 提交答案
 */
router.post('/submit', authenticate, (req, res) => {
  // TODO: 实现答案提交和评分逻辑
  res.json({
    success: true,
    message: '提交成功',
    data: {
      totalScore: 0,
      maxScore: 100,
      passed: false
    }
  });
});

module.exports = router;

