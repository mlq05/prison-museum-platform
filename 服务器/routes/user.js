/**
 * 用户相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const jwt = require('jsonwebtoken');

/**
 * 用户登录（微信登录）
 */
router.post('/login', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: '缺少登录凭证'
    });
  }

  // TODO: 这里应该调用微信API换取openId和sessionKey
  // 目前使用模拟数据
  const mockOpenId = `mock_openid_${Date.now()}`;
  const mockUser = {
    openId: mockOpenId,
    role: 'visitor',
    name: '',
    phone: '',
    verified: false
  };

  // 检查用户是否存在
  db.get('SELECT * FROM users WHERE openId = ?', [mockOpenId], (err, user) => {
    if (err) {
      console.error('查询用户失败:', err);
      return res.status(500).json({
        success: false,
        message: '登录失败'
      });
    }

    const now = Date.now();
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    if (!user) {
      // 创建新用户
      db.run(
        `INSERT INTO users (openId, role, name, phone, verified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [mockOpenId, 'visitor', '', '', 0, now, now],
        function(err) {
          if (err) {
            console.error('创建用户失败:', err);
            return res.status(500).json({
              success: false,
              message: '登录失败'
            });
          }

          const token = jwt.sign(
            { openId: mockOpenId, userId: mockOpenId, role: 'visitor' },
            jwtSecret,
            { expiresIn: '30d' }
          );

          res.json({
            success: true,
            message: '登录成功',
            data: {
              token,
              userInfo: mockUser
            }
          });
        }
      );
    } else {
      // 更新登录时间
      db.run('UPDATE users SET updatedAt = ? WHERE openId = ?', [now, mockOpenId]);

      const token = jwt.sign(
        { openId: user.openId, userId: user.openId, role: user.role },
        jwtSecret,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          userInfo: {
            openId: user.openId,
            role: user.role,
            name: user.name || '',
            phone: user.phone || '',
            verified: user.verified === 1
          }
        }
      });
    }
  });
});

/**
 * 管理员账号密码登录
 * 默认账号/密码：zysfjgxy / zysfjgxy
 */
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '请输入账号和密码',
    });
  }

  // 简单本地校验，后续可以改为数据库存储
  if (username !== 'zysfjgxy' || password !== 'zysfjgxy') {
    return res.status(401).json({
      success: false,
      message: '账号或密码错误',
    });
  }

  const now = Date.now();
  const openId = 'admin_default';

  // 确保管理员用户存在
  db.run(
    `INSERT OR IGNORE INTO users (
      openId, role, name, phone, verified, createdAt, updatedAt
    ) VALUES (?, 'admin', '管理员', '', 1, ?, ?)`,
    [openId, now, now],
    (err) => {
      if (err) {
        console.error('创建管理员用户失败:', err);
      }

      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign(
        { openId, userId: openId, role: 'admin' },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '管理员登录成功',
        data: {
          token,
          userInfo: {
            openId,
            role: 'admin',
            name: '管理员',
          },
        },
      });
    }
  );
});

/**
 * 获取用户信息
 */
router.get('/info', require('../middleware/auth').authenticate, (req, res) => {
  const userId = req.user.openId || req.user.userId;

  db.get('SELECT * FROM users WHERE openId = ?', [userId], (err, user) => {
    if (err) {
      console.error('查询用户信息失败:', err);
      return res.status(500).json({
        success: false,
        message: '查询失败'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        openId: user.openId,
        role: user.role,
        name: user.name || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        workId: user.workId || '',
        unit: user.unit || '',
        avatarUrl: user.avatarUrl || '',
        verified: user.verified === 1
      }
    });
  });
});

/**
 * 更新用户信息
 */
router.post('/update', require('../middleware/auth').authenticate, (req, res) => {
  const userId = req.user.openId || req.user.userId;
  const { name, phone, studentId, workId, unit, idCard, idCardPhoto } = req.body;

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (studentId !== undefined) {
    updates.push('studentId = ?');
    values.push(studentId);
  }
  if (workId !== undefined) {
    updates.push('workId = ?');
    values.push(workId);
  }
  if (unit !== undefined) {
    updates.push('unit = ?');
    values.push(unit);
  }
  if (idCard !== undefined) {
    updates.push('idCard = ?');
    values.push(idCard);
  }
  if (idCardPhoto !== undefined) {
    updates.push('idCardPhoto = ?');
    values.push(idCardPhoto);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: '没有要更新的字段'
    });
  }

  updates.push('updatedAt = ?');
  values.push(Date.now());
  values.push(userId);

  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE openId = ?`,
    values,
    function(err) {
      if (err) {
        console.error('更新用户信息失败:', err);
        return res.status(500).json({
          success: false,
          message: '更新失败'
        });
      }

      res.json({
        success: true,
        message: '更新成功'
      });
    }
  );
});

module.exports = router;

