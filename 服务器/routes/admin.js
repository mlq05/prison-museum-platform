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
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // 检查是否是集合不存在错误
    if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND' || error.code === 'DATABASE_COLLECTION_NOT_EXIST')) {
      return res.status(500).json({
        success: false,
        message: '数据库集合 "admins" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合',
      });
    }
    
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
router.get('/booking/list', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
      keyword
    } = req.query;

    // 处理 keyword 参数：如果是字符串 'undefined'，转换为 undefined
    const cleanKeyword = keyword && keyword !== 'undefined' && keyword !== 'null' && keyword !== '' ? keyword : undefined;
    
    // 处理 status 参数：如果是字符串 'undefined'，转换为 undefined
    const cleanStatus = status && status !== 'undefined' && status !== 'null' && status !== '' ? status : 'all';
    
    console.log('管理员查询预约列表，参数:', { 
      status: cleanStatus, 
      originalStatus: status,
      startDate, 
      endDate, 
      page, 
      pageSize, 
      keyword: cleanKeyword,
      originalKeyword: keyword,
      adminUser: req.user
    });

    // 使用云数据库API查询预约列表（管理员查看所有预约）
    const result = await collections.bookings.listAll({
      status: cleanStatus,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      keyword: cleanKeyword,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });

    console.log('管理员查询预约列表结果:', {
      listLength: result.list ? result.list.length : 0,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      sampleItems: result.list && result.list.length > 0 ? result.list.slice(0, 2).map(b => ({
        _id: b._id,
        userName: b.userName,
        bookingDate: b.bookingDate,
        status: b.status
      })) : []
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('管理员查询预约列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试'
    });
  }
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
router.post('/booking/review', async (req, res) => {
  try {
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
    
    // 使用云数据库API更新预约状态
    const reviewInfo = {
      reviewedBy: adminId,
      reviewedAt: Date.now(),
    };
    
    if (action === 'reject') {
      reviewInfo.rejectReason = rejectReason;
    }

    await collections.bookings.updateStatus(bookingId, status, reviewInfo);

    res.json({
      success: true,
      message: action === 'approve' ? '已通过审核' : '已驳回'
    });
  } catch (error) {
    console.error('审核预约失败:', error);
    if (error.message && error.message.includes('不存在')) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    res.status(500).json({
      success: false,
      message: '审核失败，请稍后重试'
    });
  }
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
 * 获取年度报告
 */
router.get('/annual-report', async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: '年份不能为空'
      });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: '年份无效'
      });
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // 查询该年度所有预约
    const allBookings = await collections.bookings.listAll({
      startDate,
      endDate,
      page: 1,
      pageSize: 10000,
    });

    const bookings = allBookings.list || [];

    // 统计来访人数
    const totalVisitors = bookings.reduce((sum, b) => sum + (b.visitorCount || 0), 0);
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const approvedVisitors = approvedBookings.reduce((sum, b) => sum + (b.visitorCount || 0), 0);

    // 统计领导来访
    const leaderVisits = bookings.filter(b => b.isLeaderVisit === true);
    const leaderVisitCount = leaderVisits.length;
    const leaderVisitVisitors = leaderVisits.reduce((sum, b) => sum + (b.visitorCount || 0), 0);

    // 统计备注高频词
    const remarkTexts = bookings
      .filter(b => b.remark && b.remark.trim())
      .map(b => b.remark.trim());
    
    // 中文分词和词频统计（简单实现）
    const wordCount = {};
    const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);
    
    remarkTexts.forEach(text => {
      // 简单的中文分词：按字符分割，过滤单个字符和停用词
      const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
      words.forEach(word => {
        if (!stopWords.has(word) && word.length >= 2) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
    });

    // 获取高频词（Top 20）
    const topWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // 按角色统计
    const roleDistribution = {
      student: 0,
      faculty: 0,
      visitor: 0
    };

    bookings.forEach(booking => {
      const role = booking.userRole || 'visitor';
      if (roleDistribution.hasOwnProperty(role)) {
        roleDistribution[role]++;
      }
    });

    // 按月统计
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      bookings: 0,
      visitors: 0,
      leaderVisits: 0
    }));

    bookings.forEach(booking => {
      const month = parseInt(booking.bookingDate.split('-')[1]) - 1;
      if (month >= 0 && month < 12) {
        monthlyStats[month].bookings++;
        monthlyStats[month].visitors += (booking.visitorCount || 0);
        if (booking.isLeaderVisit) {
          monthlyStats[month].leaderVisits++;
        }
      }
    });

    res.json({
      success: true,
      data: {
        year: yearNum,
        totalBookings: bookings.length,
        approvedBookings: approvedBookings.length,
        totalVisitors,
        approvedVisitors,
        leaderVisitCount,
        leaderVisitVisitors,
        leaderVisits: leaderVisits.map(b => ({
          _id: b._id,
          userName: b.userName,
          bookingDate: b.bookingDate,
          visitorCount: b.visitorCount,
          remark: b.remark,
          status: b.status
        })),
        topWords,
        roleDistribution,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('查询年度报告失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试'
    });
  }
});

/**
 * 获取统计数据
 */
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '日期范围不能为空'
      });
    }

    // 使用云数据库API查询预约列表
    const allBookings = await collections.bookings.listAll({
      startDate,
      endDate,
      page: 1,
      pageSize: 10000, // 获取所有数据用于统计
    });

    const bookings = allBookings.list || [];

    // 计算统计数据
    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalVisitors = bookings.reduce((sum, b) => sum + (b.visitorCount || 0), 0);

    // 计算角色分布
    const roleDistribution = {
      student: 0,
      faculty: 0,
      visitor: 0
    };

    bookings.forEach(booking => {
      const role = booking.userRole || 'visitor';
      // 添加调试日志
      if (!roleDistribution.hasOwnProperty(role)) {
        console.log('未知角色:', role, '预约ID:', booking._id);
      } else {
        roleDistribution[role]++;
      }
    });

    console.log('角色分布统计结果:', roleDistribution);
    console.log('预约总数:', totalBookings);

    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(2)
      : '0.00';

    res.json({
      success: true,
      data: {
        dateRange: { start: startDate, end: endDate },
        totalBookings,
        approvedBookings,
        cancelledBookings,
        totalVisitors,
        roleDistribution,
        cancellationRate
      }
    });
  } catch (error) {
    console.error('查询统计失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试'
    });
  }
});

module.exports = router;

