/**
 * 管理后台相关路由
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { db, collections } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * 管理员登录
 * 使用账号密码换取管理端 JWT，后续接口通过 Authorization 头传递
 * 注意：此路由必须在 router.use(authenticate) 之前定义，否则会被拦截
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
      });
    }

    // 使用云数据库API查询管理员
    const admin = await collections.admins.findByUsername(username);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 验证密码
    const isValid = bcrypt.compareSync(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
    }

    // 生成JWT token
    const payload = {
      userId: admin.username,
      role: admin.role || 'admin',
      name: admin.name || admin.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          username: admin.username,
          role: admin.role || 'admin',
          name: admin.name || admin.username,
        },
      },
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
    });
  }
});

// 所有以下管理接口都需要认证和管理员权限
// 注意：/login 路由已在上面定义，不会被这些中间件拦截
router.use((req, res, next) => {
  // 排除登录接口
  if (req.path === '/login' || req.originalUrl === '/api/admin/login') {
    return next();
  }
  authenticate(req, res, next);
});
router.use((req, res, next) => {
  // 排除登录接口
  if (req.path === '/login' || req.originalUrl === '/api/admin/login') {
    return next();
  }
  requireAdmin(req, res, next);
});

/**
 * 获取预约列表（管理员）
 */
router.get('/booking/list', (req, res) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    keyword
  } = req.query;

  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (startDate) {
    query += ' AND bookingDate >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND bookingDate <= ?';
    params.push(endDate);
  }

  if (keyword) {
    query += ' AND (userName LIKE ? OR phone LIKE ?)';
    const keywordPattern = `%${keyword}%`;
    params.push(keywordPattern, keywordPattern);
  }

  query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  const limit = parseInt(pageSize);
  const offset = (parseInt(page) - 1) * limit;
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('查询预约列表失败:', err);
      return res.status(500).json({
        success: false,
        message: '查询失败'
      });
    }

    // 获取总数
    let countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*) as total').replace(/ORDER BY.*$/, '');
    const countParams = params.slice(0, -2); // 移除LIMIT和OFFSET参数

    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        console.error('查询总数失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      // 处理数据库查询返回null的情况
      const total = countRow && countRow.total ? countRow.total : (rows ? rows.length : 0);

      res.json({
        success: true,
        data: {
          list: rows || [],
          total: total,
          page: parseInt(page),
          pageSize: limit
        }
      });
    });
  });
});

/**
 * 获取当前管理员信息
 */
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      username: req.user && req.user.userId,
      role: req.user && req.user.role,
    },
  });
});

/**
 * 审核预约
 */
router.post('/booking/review', (req, res) => {
  const { bookingId, action, rejectReason } = req.body;
  const adminId = req.user.openId || req.user.userId;

  if (!bookingId || !action) {
    return res.status(400).json({
      success: false,
      message: '参数不完整'
    });
  }

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: '操作类型无效'
    });
  }

  if (action === 'reject' && !rejectReason) {
    return res.status(400).json({
      success: false,
      message: '驳回原因不能为空'
    });
  }

  const status = action === 'approve' ? 'approved' : 'rejected';
  const now = Date.now();

  db.run(
    `UPDATE bookings 
     SET status = ?, rejectReason = ?, reviewedBy = ?, reviewedAt = ?, updatedAt = ?
     WHERE id = ?`,
    [status, rejectReason || null, adminId, now, now, bookingId],
    function(err) {
      if (err) {
        console.error('审核预约失败:', err);
        return res.status(500).json({
          success: false,
          message: '审核失败'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '预约不存在'
        });
      }

      res.json({
        success: true,
        message: action === 'approve' ? '已通过审核' : '已驳回'
      });
    }
  );
});

/**
 * 参观时段与人数配置
 */

/**
 * 获取指定日期的参观时段配置
 */
router.get('/visit/settings', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: '日期不能为空',
    });
  }

  db.all(
    `SELECT id, date, timeSlotId, timeRange, capacity, maxPerBooking, isActive
     FROM visit_settings
     WHERE date = ?
     ORDER BY timeSlotId`,
    [date],
    (err, rows) => {
      if (err) {
        console.error('查询参观时段配置失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败',
        });
      }

      res.json({
        success: true,
        data: rows || [],
      });
    }
  );
});

/**
 * 保存指定日期的参观时段配置
 * 会覆盖该日期已有配置
 */
router.post('/visit/settings', (req, res) => {
  const { date, slots } = req.body || {};

  if (!date || !Array.isArray(slots)) {
    return res.status(400).json({
      success: false,
      message: '参数不完整',
    });
  }

  const now = Date.now();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      'DELETE FROM visit_settings WHERE date = ?',
      [date],
      (deleteErr) => {
        if (deleteErr) {
          console.error('删除旧的参观时段配置失败:', deleteErr);
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            message: '保存失败，请稍后重试',
          });
        }

        const stmt = db.prepare(
          `INSERT INTO visit_settings
           (date, timeSlotId, timeRange, capacity, maxPerBooking, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );

        try {
          slots.forEach((slot) => {
            if (!slot || !slot.timeSlotId || !slot.timeRange || !slot.capacity) {
              return;
            }
            const cap = parseInt(slot.capacity, 10);
            if (Number.isNaN(cap) || cap <= 0) {
              return;
            }
            const maxPerBooking = slot.maxPerBooking
              ? parseInt(slot.maxPerBooking, 10)
              : null;

            stmt.run(
              date,
              slot.timeSlotId,
              slot.timeRange,
              cap,
              maxPerBooking,
              slot.isActive ? 1 : 0,
              now,
              now
            );
          });
        } catch (error) {
          console.error('插入参观时段配置失败:', error);
          stmt.finalize();
          db.run('ROLLBACK');
          return res.status(500).json({
            success: false,
            message: '保存失败，请稍后重试',
          });
        }

        stmt.finalize((finalizeErr) => {
          if (finalizeErr) {
            console.error('提交参观时段配置失败:', finalizeErr);
            db.run('ROLLBACK');
            return res.status(500).json({
              success: false,
              message: '保存失败，请稍后重试',
            });
          }

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('提交事务失败:', commitErr);
              return res.status(500).json({
                success: false,
                message: '保存失败，请稍后重试',
              });
            }

            res.json({
              success: true,
              message: '参观时段配置已保存',
            });
          });
        });
      }
    );
  });
});

/**
 * 获取统计数据
 */
router.get('/statistics', (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: '日期范围不能为空'
    });
  }

  // 获取预约统计
  db.get(
    `SELECT 
      COUNT(*) as totalBookings,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedBookings,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
      SUM(visitorCount) as totalVisitors
     FROM bookings
     WHERE bookingDate >= ? AND bookingDate <= ?`,
    [startDate, endDate],
    (err, stats) => {
      if (err) {
        console.error('查询统计失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      // 获取角色分布
      db.all(
        `SELECT userRole, COUNT(*) as count
         FROM bookings
         WHERE bookingDate >= ? AND bookingDate <= ?
         GROUP BY userRole`,
        [startDate, endDate],
        (err, roleStats) => {
          if (err) {
            console.error('查询角色统计失败:', err);
            return res.status(500).json({
              success: false,
              message: '查询失败'
            });
          }

          const roleDistribution = {
            student: 0,
            faculty: 0,
            visitor: 0
          };

          roleStats.forEach(stat => {
            roleDistribution[stat.userRole] = stat.count;
          });

          res.json({
            success: true,
            data: {
              dateRange: { start: startDate, end: endDate },
              totalBookings: stats.totalBookings || 0,
              approvedBookings: stats.approvedBookings || 0,
              cancelledBookings: stats.cancelledBookings || 0,
              totalVisitors: stats.totalVisitors || 0,
              roleDistribution,
              cancellationRate: stats.totalBookings > 0 
                ? ((stats.cancelledBookings || 0) / stats.totalBookings * 100).toFixed(2)
                : 0
            }
          });
        }
      );
    }
  );
});

module.exports = router;

