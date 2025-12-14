/**
 * 用户相关路由
 */

const express = require('express');
const router = express.Router();
const { db, collections } = require('../db/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
 * 用户注册（账号密码注册，绑定openId）
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, openId, code } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
      });
    }

    // 验证用户名格式（4-20个字符，只能包含字母、数字、下划线）
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: '用户名格式不正确（4-20个字符，只能包含字母、数字、下划线）',
      });
    }

    // 验证密码强度（至少6位）
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位',
      });
    }

    // 验证身份角色
    const validRoles = ['student', 'faculty', 'visitor'];
    const userRole = validRoles.includes(role) ? role : 'visitor';

    // 如果提供了code，使用微信登录获取openId（暂时模拟）
    let userOpenId = openId;
    if (!userOpenId && code) {
      // TODO: 调用微信API换取openId
      // 目前使用模拟数据
      userOpenId = `wx_openid_${Date.now()}`;
    }

    // 如果没有openId也没有code，生成一个临时的openId
    if (!userOpenId) {
      userOpenId = `temp_openid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 检查用户名是否已存在
    const existingUser = await collections.users.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在',
      });
    }

    // 检查openId是否已绑定账号
    const existingByOpenId = await collections.users.findByOpenId(userOpenId);
    if (existingByOpenId && existingByOpenId.username) {
      return res.status(400).json({
        success: false,
        message: '该微信账号已绑定其他用户名',
      });
    }

    // 加密密码
    const passwordHash = bcrypt.hashSync(password, 10);

    // 创建用户或更新现有用户
    const now = Date.now();
    let user;
    
    if (existingByOpenId) {
      // 更新现有用户，绑定账号密码和身份
      user = await collections.users.update(userOpenId, {
        username,
        passwordHash,
        role: userRole, // 同步更新身份信息
        updatedAt: now,
      });
    } else {
      // 创建新用户
      user = await collections.users.create({
        openId: userOpenId,
        username,
        passwordHash,
        role: userRole,
        name: '',
        phone: '',
        verified: false,
      });
    }

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        openId: user.openId,
        userId: user.openId,
        role: user.role || 'visitor',
        username: user.username,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        userInfo: {
          openId: user.openId,
          username: user.username,
          role: user.role || 'visitor',
          name: user.name || '',
          phone: user.phone || '',
          verified: user.verified || false,
        },
      },
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败：' + (error.message || '服务器错误'),
    });
  }
});

/**
 * 用户账号密码登录
 */
router.post('/login-account', async (req, res) => {
  try {
    const { username, password, code } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
      });
    }

    // 查找用户
    const user = await collections.users.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 验证密码
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: '该账号未设置密码，请使用微信登录',
      });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 如果提供了code，尝试更新openId（绑定微信）
    let userOpenId = user.openId;
    if (code) {
      // TODO: 调用微信API换取openId
      // 目前使用模拟数据
      const wxOpenId = `wx_openid_${Date.now()}`;
      
      // 检查新的openId是否已被其他账号使用
      const existingByWxOpenId = await collections.users.findByOpenId(wxOpenId);
      if (!existingByWxOpenId || existingByWxOpenId._id === user._id) {
        // 更新openId，绑定微信
        await collections.users.update(userOpenId, {
          openId: wxOpenId,
        });
        userOpenId = wxOpenId;
      }
    }

    // 更新最后登录时间
    await collections.users.update(userOpenId, {
      lastLoginAt: Date.now(),
    });

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        openId: userOpenId,
        userId: userOpenId,
        role: user.role || 'visitor',
        username: user.username,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          openId: userOpenId,
          username: user.username,
          role: user.role || 'visitor',
          name: user.name || '',
          phone: user.phone || '',
          verified: user.verified || false,
        },
      },
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败：' + (error.message || '服务器错误'),
    });
  }
});

/**
 * 检查用户名是否可用
 */
router.get('/check-username', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空',
      });
    }

    // 验证用户名格式
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '用户名格式不正确（4-20个字符，只能包含字母、数字、下划线）',
        },
      });
    }

    // 检查用户名是否已存在
    const existingUser = await collections.users.findByUsername(username);
    
    res.json({
      success: true,
      data: {
        available: !existingUser,
        message: existingUser ? '用户名已存在' : '用户名可用',
      },
    });
  } catch (error) {
    console.error('检查用户名失败:', error);
    res.status(500).json({
      success: false,
      message: '检查失败：' + (error.message || '服务器错误'),
    });
  }
});

/**
 * 获取用户信息
 */
router.get('/info', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const userId = req.user.openId || req.user.userId;

    const user = await collections.users.findByOpenId(userId);
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
        username: user.username || '',
        role: user.role || 'visitor',
        name: user.name || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        workId: user.workId || '',
        unit: user.unit || '',
        avatarUrl: user.avatarUrl || '',
        verified: user.verified || false
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败：' + (error.message || '服务器错误'),
    });
  }
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

/**
 * 获取用户统计数据（预约数、收藏数、证书数）
 */
router.get('/statistics', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const userId = req.user?.openId || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    // 使用云数据库API查询统计数据
    const { cloudDb } = require('../db/database');
    
    // 1. 查询预约数量
    let bookingCount = 0;
    try {
      const { list } = await collections.bookings.listByUser(userId, {
        page: 1,
        pageSize: 10000, // 获取所有预约用于统计
      });
      bookingCount = list?.length || 0;
    } catch (e) {
      console.error('查询预约数量失败:', e);
      bookingCount = 0;
    }

    // 2. 查询收藏数量
    let collectionCount = 0;
    try {
      if (cloudDb) {
        try {
          const collectionsResult = await cloudDb.collection('collections')
            .where({ userId: userId })
            .count();
          collectionCount = collectionsResult.total || 0;
        } catch (e) {
          // 集合可能不存在，使用默认值0
          console.log('collections集合查询失败（可能不存在）:', e.message);
          collectionCount = 0;
        }
      }
    } catch (e) {
      console.error('查询收藏数量失败:', e);
      collectionCount = 0;
    }

    // 3. 查询证书数量
    let certificateCount = 0;
    try {
      if (cloudDb) {
        try {
          const certificatesResult = await cloudDb.collection('certificates')
            .where({ userId: userId })
            .count();
          certificateCount = certificatesResult.total || 0;
        } catch (e) {
          // 集合可能不存在，使用默认值0
          console.log('certificates集合查询失败（可能不存在）:', e.message);
          certificateCount = 0;
        }
      }
    } catch (e) {
      console.error('查询证书数量失败:', e);
      certificateCount = 0;
    }

    res.json({
      success: true,
      data: {
        bookingCount,
        collectionCount,
        certificateCount,
      }
    });
  } catch (error) {
    console.error('查询用户统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
      data: {
        bookingCount: 0,
        collectionCount: 0,
        certificateCount: 0,
      }
    });
  }
});

module.exports = router;

