/**
 * 开放日设置相关路由
 */

const express = require('express');
const router = express.Router();
const { cloudDb } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * 检查指定日期是否是开放日的辅助函数
 * 可以在其他路由中使用
 */
async function checkIfOpenDay(dateStr) {
  try {
    // 解析日期
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return false;
    }

    const weekday = date.getDay(); // 0=周日, 5=周五, 6=周六
    const dateOnly = dateStr.split('T')[0]; // YYYY-MM-DD格式

    // 首先检查默认开放日（每周五、六）
    if (weekday === 5 || weekday === 6) {
      return true; // 默认周五、周六为开放日
    }

    // 如果数据库未初始化，只检查默认开放日
    if (!cloudDb) {
      return false;
    }

    // 查询所有开放日设置（包括管理员自定义的）
    try {
      const result = await cloudDb.collection('open_days').get();
      const openDays = result.data || [];

      // 检查是否匹配自定义开放日
      for (const openDay of openDays) {
        if (openDay.type === 'weekday' && openDay.weekday === weekday) {
          return true;
        }
        if (openDay.type === 'date' && openDay.date === dateOnly) {
          return true;
        }
      }
    } catch (dbError) {
      // 数据库查询失败，只依赖默认开放日判断
      console.warn('查询开放日数据库失败:', dbError);
    }

    return false;
  } catch (error) {
    console.error('检查开放日失败:', error);
    return false;
  }
}

/**
 * 检查指定日期是否是开放日（公开接口，无需登录）
 */
router.get('/check', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '日期不能为空',
      });
    }

    const isOpenDay = await checkIfOpenDay(date);

    res.json({
      success: true,
      data: {
        date,
        isOpenDay,
      },
    });
  } catch (error) {
    console.error('检查开放日失败:', error);
    res.status(500).json({
      success: false,
      message: '检查失败，请稍后重试',
    });
  }
});

// 以下接口需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * 获取所有开放日设置
 */
router.get('/list', async (req, res) => {
  try {
    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const result = await cloudDb.collection('open_days').get();
    const openDays = result.data || [];

    res.json({
      success: true,
      data: openDays,
    });
  } catch (error) {
    console.error('查询开放日列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
    });
  }
});

/**
 * 添加开放日
 */
router.post('/add', async (req, res) => {
  try {
    const { date, type, description } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '日期不能为空',
      });
    }

    // type: 'weekday' (每周固定星期几) 或 'date' (具体日期)
    if (!type || !['weekday', 'date'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '类型必须是 weekday 或 date',
      });
    }

    if (type === 'weekday' && (!req.body.weekday || req.body.weekday < 0 || req.body.weekday > 6)) {
      return res.status(400).json({
        success: false,
        message: '星期数必须在 0-6 之间（0=周日，5=周五，6=周六）',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    // 检查是否已存在
    let query;
    if (type === 'weekday') {
      query = cloudDb.collection('open_days').where({
        type: 'weekday',
        weekday: req.body.weekday,
      });
    } else {
      query = cloudDb.collection('open_days').where({
        type: 'date',
        date: date,
      });
    }

    const existing = await query.get();
    if (existing.data && existing.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该开放日已存在',
      });
    }

    // 添加开放日
    const openDayData = {
      type,
      date: type === 'date' ? date : null,
      weekday: type === 'weekday' ? req.body.weekday : null,
      description: description || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await cloudDb.collection('open_days').add(openDayData);

    res.json({
      success: true,
      message: '添加成功',
      data: {
        _id: result.id,
        ...openDayData,
      },
    });
  } catch (error) {
    console.error('添加开放日失败:', error);
    res.status(500).json({
      success: false,
      message: '添加失败，请稍后重试',
    });
  }
});

/**
 * 删除开放日
 */
router.delete('/remove', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID不能为空',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    await cloudDb.collection('open_days').doc(id).remove();

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除开放日失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试',
    });
  }
});

/**
 * 初始化默认开放日（每周五、六）
 */
router.post('/init-default', async (req, res) => {
  try {
    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    // 检查是否已有周五设置
    const fridayCheck = await cloudDb.collection('open_days').where({
      type: 'weekday',
      weekday: 5, // 周五
    }).get();

    // 检查是否已有周六设置
    const saturdayCheck = await cloudDb.collection('open_days').where({
      type: 'weekday',
      weekday: 6, // 周六
    }).get();

    const now = Date.now();
    const added = [];

    if (!fridayCheck.data || fridayCheck.data.length === 0) {
      const fridayResult = await cloudDb.collection('open_days').add({
        type: 'weekday',
        weekday: 5,
        date: null,
        description: '每周五开放日',
        createdAt: now,
        updatedAt: now,
      });
      added.push({ weekday: 5, id: fridayResult.id });
    }

    if (!saturdayCheck.data || saturdayCheck.data.length === 0) {
      const saturdayResult = await cloudDb.collection('open_days').add({
        type: 'weekday',
        weekday: 6,
        date: null,
        description: '每周六开放日',
        createdAt: now,
        updatedAt: now,
      });
      added.push({ weekday: 6, id: saturdayResult.id });
    }

    res.json({
      success: true,
      message: added.length > 0 ? '默认开放日已初始化' : '默认开放日已存在',
      data: {
        added,
      },
    });
  } catch (error) {
    console.error('初始化默认开放日失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化失败，请稍后重试',
    });
  }
});

// 导出函数供其他模块使用
module.exports = router;
module.exports.checkIfOpenDay = checkIfOpenDay;

