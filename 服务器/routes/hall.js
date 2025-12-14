/**
 * 展区相关路由
 */

const express = require('express');
const router = express.Router();
const { db, collections } = require('../db/database');

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

/**
 * 获取展区收藏数
 */
router.get('/collection-count', async (req, res) => {
  try {
    const { hallId } = req.query;

    if (!hallId) {
      return res.status(400).json({
        success: false,
        message: '展区ID不能为空'
      });
    }

    // 使用云数据库查询该展区的收藏数
    const { cloudDb } = require('../db/database');
    if (cloudDb) {
      const countResult = await cloudDb.collection('collections')
        .where({
          type: 'hall',
          itemId: hallId.toString(),
        })
        .count();
      
      res.json({
        success: true,
        data: countResult.total || 0
      });
    } else {
      res.json({
        success: true,
        data: 0
      });
    }
  } catch (error) {
    console.error('查询展区收藏数失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败',
      data: 0
    });
  }
});

/**
 * 获取首页统计数据
 */
router.get('/home-statistics', async (req, res) => {
  try {
    // 1. 累计参观数量：所有审批通过的预约的总参观人数（visitorCount累加）
    const allBookings = await collections.bookings.listAll({
      page: 1,
      pageSize: 100000,
    });
    
    const approvedBookings = (allBookings.list || []).filter(b => b.status === 'approved');
    const totalVisitors = approvedBookings.reduce((sum, b) => sum + (b.visitorCount || 0), 0);

    // 2. AR体验次数：统计ar_clicks集合中的记录数
    let arUsageCount = 0;
    try {
      const { cloudDb } = require('../db/database');
      if (cloudDb) {
        // 查询ar_clicks集合
        try {
          const arClicksResult = await cloudDb.collection('ar_clicks').count();
          arUsageCount = arClicksResult.total || 0;
        } catch (e) {
          // ar_clicks集合可能不存在，尝试查询ar_checkins
          try {
            const arCheckInsResult = await cloudDb.collection('ar_checkins').count();
            arUsageCount = arCheckInsResult.total || 0;
          } catch (e2) {
            // 两个集合都不存在，使用0
            console.log('AR统计集合不存在，使用默认值0');
          }
        }
      }
    } catch (e) {
      console.error('查询AR统计失败:', e);
      arUsageCount = 0;
    }

    // 3. 展区数量：查询halls集合中启用的展区数量
    let totalHalls = 8; // 默认值
    try {
      const { cloudDb } = require('../db/database');
      if (cloudDb) {
        const hallsResult = await cloudDb.collection('halls')
          .where({ isActive: true })
          .count();
        totalHalls = hallsResult.total || 8;
      }
    } catch (e) {
      console.error('查询展区数量失败:', e);
      totalHalls = 8;
    }

    // 4. 收藏总数：统计collections集合中的记录数
    let totalCollections = 0;
    try {
      const { cloudDb } = require('../db/database');
      if (cloudDb) {
        const collectionsResult = await cloudDb.collection('collections').count();
        totalCollections = collectionsResult.total || 0;
      }
    } catch (e) {
      console.error('查询收藏总数失败:', e);
      totalCollections = 0;
    }

    res.json({
      success: true,
      data: {
        totalVisitors,
        totalHalls,
        arUsageCount,
        totalCollections,
      }
    });
  } catch (error) {
    console.error('查询首页统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
      data: {
        totalVisitors: 0,
        totalHalls: 8,
        arUsageCount: 0,
        totalCollections: 0,
      }
    });
  }
});

module.exports = router;

