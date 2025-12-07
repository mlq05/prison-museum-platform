/**
 * 预约相关路由
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');
const moment = require('moment');

/**
 * 创建预约
 */
router.post('/create', authenticate, (req, res) => {
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
    idCardPhoto
  } = req.body;

  // 验证必填字段
  if (!bookingDate || !bookingTimeSlot || !visitorCount || !name || !phone) {
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
  const maxCount = parseInt(process.env.MAX_VISITOR_COUNT) || 10;
  if (visitorCount < 1 || visitorCount > maxCount) {
    return res.status(400).json({
      success: false,
      message: `参观人数必须在1-${maxCount}人之间`
    });
  }

  const now = Date.now();
  const userId = req.user.openId || req.user.userId;
  const userRole = req.user.role || 'visitor';

  // 检查该日期与时段的总人数是否超过管理员配置的容量
  db.get(
    `SELECT 
       vs.capacity,
       vs.maxPerBooking,
       IFNULL(SUM(b.visitorCount), 0) AS usedCount
     FROM visit_settings vs
     LEFT JOIN bookings b
       ON vs.date = b.bookingDate
       AND vs.timeSlotId = b.bookingTimeSlot
       AND b.status IN ('pending', 'approved')
     WHERE vs.date = ?
       AND vs.timeSlotId = ?
       AND vs.isActive = 1`,
    [bookingDate, bookingTimeSlot],
    (err, row) => {
      if (err) {
        console.error('查询参观时段配置失败:', err);
        return res.status(500).json({
          success: false,
          message: '创建预约失败，请稍后重试'
        });
      }

      // 如果没有配置，则使用环境变量中的默认容量
      const slotsPerTime = parseInt(process.env.SLOTS_PER_TIME) || 20;
      const capacity = row ? row.capacity : slotsPerTime;
      const usedCount = row ? row.usedCount : 0;
      const maxPerBookingSetting = row && row.maxPerBooking ? row.maxPerBooking : null;

      if (maxPerBookingSetting && visitorCount > maxPerBookingSetting) {
        return res.status(400).json({
          success: false,
          message: `单次预约人数不能超过${maxPerBookingSetting}人`
        });
      }

      if (usedCount + visitorCount > capacity) {
        return res.status(400).json({
          success: false,
          message: '该时段预约人数已满，请选择其他时段或日期'
        });
      }

      // 插入预约记录
      db.run(
        `INSERT INTO bookings (
          userId, userName, userRole, phone, bookingDate, bookingTimeSlot,
          visitorCount, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [userId, name, userRole, phone, bookingDate, bookingTimeSlot, visitorCount, now, now],
        function(err2) {
          if (err2) {
            console.error('创建预约失败:', err2);
            return res.status(500).json({
              success: false,
              message: '创建预约失败，请稍后重试'
            });
          }

          res.json({
            success: true,
            message: '预约提交成功',
            data: {
              bookingId: this.lastID.toString()
            }
          });
        }
      );
    }
  );
});

/**
 * 获取预约列表
 */
router.get('/list', authenticate, (req, res) => {
  const { status, page = 1, pageSize = 10 } = req.query;
  const userId = req.user.openId || req.user.userId;

  // 开发环境下，为了方便调试，允许查看所有预约记录
  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  if (!isDev) {
    query += ' AND userId = ?';
    params.push(userId);
  }

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
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
    let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE 1=1';
    const countParams = [];
    if (!isDev) {
      countQuery += ' AND userId = ?';
      countParams.push(userId);
    }
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

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
 * 获取预约详情
 */
router.get('/detail', authenticate, (req, res) => {
  const { id } = req.query;
  const userId = req.user.openId || req.user.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '预约ID不能为空'
    });
  }

  db.get('SELECT * FROM bookings WHERE id = ? AND userId = ?', [id, userId], (err, row) => {
    if (err) {
      console.error('查询预约详情失败:', err);
      return res.status(500).json({
        success: false,
        message: '查询失败'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
});

/**
 * 取消预约
 */
router.post('/cancel', authenticate, (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.openId || req.user.userId;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: '预约ID不能为空'
    });
  }

  // 验证权限
  db.get('SELECT * FROM bookings WHERE id = ? AND userId = ?', [bookingId, userId], (err, booking) => {
    if (err) {
      console.error('查询预约失败:', err);
      return res.status(500).json({
        success: false,
        message: '查询失败'
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '预约已取消'
      });
    }

    // 更新状态
    db.run(
      'UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?',
      ['cancelled', Date.now(), bookingId],
      function(err) {
        if (err) {
          console.error('取消预约失败:', err);
          return res.status(500).json({
            success: false,
            message: '取消预约失败'
          });
        }

        res.json({
          success: true,
          message: '预约已取消'
        });
      }
    );
  });
});

/**
 * 获取预约日历数据
 */
router.get('/calendar', (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: '日期范围不能为空'
    });
  }

  // 查询指定日期范围内的预约
  db.all(
    `SELECT 
       b.bookingDate,
       b.bookingTimeSlot,
       b.visitorCount,
       b.status
     FROM bookings b
     WHERE b.bookingDate >= ? AND b.bookingDate <= ? 
       AND b.status IN ('pending', 'approved')`,
    [startDate, endDate],
    (err, bookingRows) => {
      if (err) {
        console.error('查询预约日历失败:', err);
        return res.status(500).json({
          success: false,
          message: '查询失败'
        });
      }

      // 查询对应日期范围内的管理员时段配置
      db.all(
        `SELECT date, timeSlotId, timeRange, capacity
         FROM visit_settings
         WHERE date >= ? AND date <= ? AND isActive = 1`,
        [startDate, endDate],
        (err2, settingRows) => {
          if (err2) {
            console.error('查询参观时段配置失败:', err2);
            return res.status(500).json({
              success: false,
              message: '查询失败'
            });
          }

          const dateMap = {};
          const slotsPerTime = parseInt(process.env.SLOTS_PER_TIME) || 20;

          // 根据配置初始化每一天的时段
          settingRows.forEach(setting => {
            if (!dateMap[setting.date]) {
              dateMap[setting.date] = {
                date: setting.date,
                timeSlots: [],
                totalAvailable: 0,
                isFull: false
              };
            }
            dateMap[setting.date].timeSlots.push({
              id: setting.timeSlotId,
              time: setting.timeRange,
              available: setting.capacity,
              total: setting.capacity,
              isWarning: false
            });
          });

          // 如果某天没有专门配置，则使用默认4个时段
          const ensureDate = (d) => {
            if (!dateMap[d]) {
              dateMap[d] = {
                date: d,
                timeSlots: [
                  { id: 'morning1', time: '09:00-11:00', available: slotsPerTime, total: slotsPerTime, isWarning: false },
                  { id: 'morning2', time: '11:00-13:00', available: slotsPerTime, total: slotsPerTime, isWarning: false },
                  { id: 'afternoon1', time: '14:00-16:00', available: slotsPerTime, total: slotsPerTime, isWarning: false },
                  { id: 'afternoon2', time: '16:00-18:00', available: slotsPerTime, total: slotsPerTime, isWarning: false }
                ],
                totalAvailable: slotsPerTime * 4,
                isFull: false
              };
            }
          };

          bookingRows.forEach(booking => {
            ensureDate(booking.bookingDate);

            const dayInfo = dateMap[booking.bookingDate];
            const slot = dayInfo.timeSlots.find(s => s.id === booking.bookingTimeSlot);
            if (slot) {
              slot.available = Math.max(0, slot.available - booking.visitorCount);
            }
          });

          // 计算总可用名额
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
        }
      );
    }
  );
});

module.exports = router;

