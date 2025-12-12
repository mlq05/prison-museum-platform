/**
 * 预约相关路由
 */

const express = require('express');
const router = express.Router();
const { db, cloudDb, collections } = require('../db/database');
const { authenticate } = require('../middleware/auth');
const moment = require('moment');

/**
 * 创建预约
 */
router.post('/create', authenticate, (req, res) => {
  console.log('收到创建预约请求:', {
    body: req.body,
    user: req.user
  });

  const {
    bookingDate,
    bookingTimeSlot,
    visitorCount,
    name,
    phone,
    studentId,
    workId,
    unit,
    idCard,
    idCardPhoto,
    remark // 备注信息
  } = req.body;

  // 验证必填字段
  if (!bookingDate || !bookingTimeSlot || !visitorCount || !name || !phone) {
    console.log('必填字段验证失败:', { bookingDate, bookingTimeSlot, visitorCount, name, phone });
    return res.status(400).json({
      success: false,
      message: '请填写完整的预约信息'
    });
  }

  // 验证日期
  const bookingMoment = moment(bookingDate);
  if (!bookingMoment.isValid() || bookingMoment.isBefore(moment(), 'day')) {
    return res.status(400).json({
      success: false,
      message: '预约日期无效'
    });
  }

  // 验证人数（单次预约人数上限）
  const visitorCountNum = parseInt(visitorCount);
  if (isNaN(visitorCountNum) || visitorCountNum < 1) {
    return res.status(400).json({
      success: false,
      message: '参观人数无效，必须大于0'
    });
  }

  const maxCount = parseInt(process.env.MAX_VISITOR_COUNT) || 10;
  if (visitorCountNum > maxCount) {
    return res.status(400).json({
      success: false,
      message: `参观人数不能超过${maxCount}人`
    });
  }

    const now = Date.now();
    // 优先使用 openId，如果没有则使用 userId（兼容开发环境和生产环境）
    const userId = req.user.openId || req.user.userId;
    const userRole = req.user.role || 'visitor';
    
    console.log('创建预约 - 用户信息:', { userId, userRole, openId: req.user.openId, userIdField: req.user.userId });

  // 使用云数据库API检查容量并创建预约
  (async () => {
    try {
      // 检查该日期与时段的总人数是否超过管理员配置的容量
      const countResult = await collections.bookings.countByDateAndTimeSlot(bookingDate, bookingTimeSlot);
      const usedCount = countResult.totalCount || 0;

      // 查询时段配置（暂时使用默认值，后续可以添加visit_settings集合查询）
      const slotsPerTime = parseInt(process.env.SLOTS_PER_TIME) || 20;
      const capacity = slotsPerTime; // 默认容量
      const maxPerBookingSetting = null; // 暂时不限制单次预约人数

      console.log('时段容量检查:', {
        bookingDate,
        bookingTimeSlot,
        capacity,
        usedCount,
        visitorCount: visitorCountNum,
        available: capacity - usedCount
      });

      if (maxPerBookingSetting && visitorCountNum > maxPerBookingSetting) {
        return res.status(400).json({
          success: false,
          message: `单次预约人数不能超过${maxPerBookingSetting}人`
        });
      }

      if (usedCount + visitorCountNum > capacity) {
        return res.status(400).json({
          success: false,
          message: '该时段预约人数已满，请选择其他时段或日期'
        });
      }

      // 使用云数据库API插入预约记录
      const booking = await collections.bookings.create({
        userId,
        userName: name,
        userRole,
        phone,
        bookingDate,
        bookingTimeSlot,
        visitorCount: visitorCountNum,
        remark: remark || '', // 备注信息（可选）
      });

      console.log('预约创建成功:', {
        bookingId: booking._id,
        userId,
        bookingDate,
        bookingTimeSlot,
        visitorCount: visitorCountNum
      });

      res.json({
        success: true,
        message: '预约提交成功',
        data: {
          bookingId: booking._id
        }
      });
    } catch (error) {
      console.error('创建预约失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      });
      res.status(500).json({
        success: false,
        message: '创建预约失败，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })();
});

/**
 * 获取预约列表
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    const userId = req.user.openId || req.user.userId;

    console.log('查询预约列表:', { userId, status, page, pageSize });

    // 使用云数据库API查询预约列表
    const result = await collections.bookings.listByUser(userId, {
      status: status || 'all',
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });

    console.log('预约列表查询结果:', {
      count: result.list.length,
      total: result.total,
    });

    res.json({
      success: true,
      data: {
        list: result.list || [],
        total: result.total || 0,
        page: result.page,
        pageSize: result.pageSize,
      }
    });
  } catch (error) {
    console.error('查询预约列表失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: '查询失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 获取预约详情
 */
router.get('/detail', authenticate, async (req, res) => {
  try {
    const { id } = req.query;
    // 获取用户ID：优先使用 openId，如果没有则使用 userId
    // 同时检查 openId 和 userId，因为不同环境可能使用不同的字段
    const currentOpenId = req.user.openId;
    const currentUserId = req.user.userId;
    const userRole = req.user.role;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '预约ID不能为空'
      });
    }

    console.log('查询预约详情:', { 
      id, 
      currentOpenId, 
      currentUserId, 
      userRole,
      fullUser: req.user
    });

    // 使用云数据库API查询预约详情
    const booking = await collections.bookings.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    // 调试：输出完整的 booking 对象（只包含关键字段）
    console.log('预约详情查询结果:', {
      bookingId: booking._id,
      bookingUserId: booking.userId,
      bookingPhone: booking.phone,
      bookingAllKeys: Object.keys(booking),
      bookingSample: {
        _id: booking._id,
        userId: booking.userId,
        userName: booking.userName,
        phone: booking.phone,
        bookingDate: booking.bookingDate,
        status: booking.status
      },
      currentOpenId,
      currentUserId,
      currentPhone: req.user.phone,
      openIdMatch: booking.userId === currentOpenId,
      userIdMatch: booking.userId === currentUserId
    });

    // 验证权限：
    // 1. 管理员可以查看所有预约
    // 2. 普通用户只能查看自己的预约（通过 userId 匹配）
    const isAdmin = userRole === 'admin';
    
    // 判断是否是预约的所有者
    // 注意：不再兼容旧数据，要求预约必须有 userId 字段
    if (!booking.userId) {
      console.error('预约记录缺少 userId 字段:', {
        bookingId: booking._id,
        bookingKeys: Object.keys(booking)
      });
      return res.status(500).json({
        success: false,
        message: '预约数据异常，缺少用户ID'
      });
    }
    
    // 使用 userId 匹配（匹配 openId 或 userId）
    const isOwner = booking.userId === currentOpenId || booking.userId === currentUserId;
    
    if (!isAdmin && !isOwner) {
      console.log('权限检查失败:', {
        userRole,
        bookingUserId: booking.userId,
        currentOpenId,
        currentUserId,
        isOwner,
        isAdmin,
        openIdMatch: booking.userId === currentOpenId,
        userIdMatch: booking.userId === currentUserId
      });
      return res.status(403).json({
        success: false,
        message: '无权访问此预约'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('查询预约详情失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

/**
 * 取消预约
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.openId || req.user.userId;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: '预约ID不能为空'
      });
    }

    // 使用云数据库API查询预约
    const booking = await collections.bookings.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    // 验证权限
    const userRole = req.user.role;
    const currentOpenId = req.user.openId;
    const currentUserId = req.user.userId;
    
    // 管理员可以取消任何预约
    if (userRole === 'admin') {
      // 允许取消
    } else {
      // 普通用户只能取消自己的预约
      // 注意：不再兼容旧数据，要求预约必须有 userId 字段
      if (!booking.userId) {
        return res.status(500).json({
          success: false,
          message: '预约数据异常，缺少用户ID'
        });
      }
      
      const isOwner = booking.userId === currentOpenId || booking.userId === currentUserId;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: '无权取消此预约'
        });
      }
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '预约已取消'
      });
    }

    // 使用云数据库API更新状态
    await collections.bookings.updateStatus(bookingId, 'cancelled');

    res.json({
      success: true,
      message: '预约已取消'
    });
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({
      success: false,
      message: '取消预约失败'
    });
  }
});

/**
 * 获取预约日历数据
 */
router.get('/calendar', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '日期范围不能为空'
      });
    }

    // 使用云数据库API查询指定日期范围内的预约
    const bookings = await collections.bookings.listByDateRange(startDate, endDate);

    const dateMap = {};
    const slotsPerTime = parseInt(process.env.SLOTS_PER_TIME) || 20;

    // 默认时段配置
    const defaultTimeSlots = [
      { id: 'morning1', time: '09:00-11:00' },
      { id: 'morning2', time: '11:00-13:00' },
      { id: 'afternoon1', time: '14:00-16:00' },
      { id: 'afternoon2', time: '16:00-18:00' }
    ];

    // 初始化日期范围内的每一天
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = {
        date: dateStr,
        timeSlots: defaultTimeSlots.map(slot => ({
          id: slot.id,
          time: slot.time,
          available: slotsPerTime,
          total: slotsPerTime,
          isWarning: false
        })),
        totalAvailable: slotsPerTime * 4,
        isFull: false
      };
    }

    // 根据预约记录更新可用名额
    bookings.forEach(booking => {
      if (dateMap[booking.bookingDate]) {
        const dayInfo = dateMap[booking.bookingDate];
        const slot = dayInfo.timeSlots.find(s => s.id === booking.bookingTimeSlot);
        if (slot) {
          slot.available = Math.max(0, slot.available - (booking.visitorCount || 0));
        }
      }
    });

    // 计算总可用名额和警告状态
    Object.keys(dateMap).forEach(date => {
      const dateData = dateMap[date];
      dateData.totalAvailable = dateData.timeSlots.reduce((sum, slot) => sum + slot.available, 0);
      dateData.isFull = dateData.totalAvailable === 0;
      dateData.timeSlots.forEach(slot => {
        slot.isWarning = slot.available <= 5;
      });
    });

    res.json({
      success: true,
      data: Object.values(dateMap)
    });
  } catch (error) {
    console.error('查询预约日历失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: '查询失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

