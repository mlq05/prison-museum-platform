/**
 * 公告管理相关路由
 */

const express = require('express');
const router = express.Router();
const { cloudDb } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * 获取公告列表（公开接口，无需登录）
 * 只返回已发布且未过期的公告
 */
router.get('/list', async (req, res) => {
  try {
    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const { page = 1, pageSize = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询已发布且未过期的公告
    const now = Date.now();
    const query = cloudDb.collection('announcements')
      .where({
        status: 'published',
        $or: [
          { expireAt: null },
          { expireAt: { $gt: now } },
        ],
      })
      .orderBy('publishAt', 'desc')
      .skip(skip)
      .limit(limit);

    const result = await query.get();
    const announcements = result.data || [];

    res.json({
      success: true,
      data: announcements,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('查询公告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
    });
  }
});

/**
 * 获取公告详情（公开接口，无需登录）
 */
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '公告ID不能为空',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const result = await cloudDb.collection('announcements').doc(id).get();
    const announcement = result.data[0];

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
      });
    }

    // 检查是否已发布且未过期
    const now = Date.now();
    if (announcement.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: '公告未发布',
      });
    }

    if (announcement.expireAt && announcement.expireAt < now) {
      return res.status(403).json({
        success: false,
        message: '公告已过期',
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('查询公告详情失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
    });
  }
});

// 以下接口需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * 获取所有公告（管理员，包括草稿和已发布的）
 */
router.get('/admin/list', async (req, res) => {
  try {
    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const { page = 1, pageSize = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let query = cloudDb.collection('announcements');
    
    // 如果指定了状态，添加过滤条件
    if (status && status !== 'all') {
      query = query.where({ status });
    }

    query = query.orderBy('createdAt', 'desc').skip(skip).limit(limit);

    const result = await query.get();
    const announcements = result.data || [];

    res.json({
      success: true,
      data: announcements,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('查询公告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试',
    });
  }
});

/**
 * 创建公告（管理员）
 */
router.post('/create', async (req, res) => {
  try {
    const { title, content, summary, status = 'draft', expireAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const now = Date.now();
    const announcementData = {
      title,
      content,
      summary: summary || content.substring(0, 100), // 如果没有摘要，自动截取前100字符
      status, // draft: 草稿, published: 已发布
      publishAt: status === 'published' ? now : null,
      expireAt: expireAt ? new Date(expireAt).getTime() : null,
      createdAt: now,
      updatedAt: now,
      createdBy: req.user.userId || req.user.openId,
    };

    const result = await cloudDb.collection('announcements').add(announcementData);

    res.json({
      success: true,
      message: '创建成功',
      data: {
        _id: result.id,
        ...announcementData,
      },
    });
  } catch (error) {
    console.error('创建公告失败:', error);
    res.status(500).json({
      success: false,
      message: '创建失败，请稍后重试',
    });
  }
});

/**
 * 更新公告（管理员）
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, status, expireAt } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '公告ID不能为空',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    // 检查公告是否存在
    const existing = await cloudDb.collection('announcements').doc(id).get();
    if (!existing.data || existing.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
      });
    }

    const updateData = {
      updatedAt: Date.now(),
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (status !== undefined) {
      updateData.status = status;
      // 如果状态改为已发布，设置发布时间
      if (status === 'published' && !existing.data[0].publishAt) {
        updateData.publishAt = Date.now();
      }
    }
    if (expireAt !== undefined) {
      updateData.expireAt = expireAt ? new Date(expireAt).getTime() : null;
    }

    await cloudDb.collection('announcements').doc(id).update(updateData);

    res.json({
      success: true,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败，请稍后重试',
    });
  }
});

/**
 * 删除公告（管理员）
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '公告ID不能为空',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    await cloudDb.collection('announcements').doc(id).remove();

    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除公告失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败，请稍后重试',
    });
  }
});

/**
 * 发布/取消发布公告（管理员）
 */
router.post('/publish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' 或 'draft'

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '公告ID不能为空',
      });
    }

    if (!status || !['published', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '状态必须是 published 或 draft',
      });
    }

    if (!cloudDb) {
      return res.status(500).json({
        success: false,
        message: '数据库未初始化',
      });
    }

    const updateData = {
      status,
      updatedAt: Date.now(),
    };

    // 如果发布，设置发布时间
    if (status === 'published') {
      updateData.publishAt = Date.now();
    }

    await cloudDb.collection('announcements').doc(id).update(updateData);

    res.json({
      success: true,
      message: status === 'published' ? '发布成功' : '已取消发布',
    });
  } catch (error) {
    console.error('发布公告失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败，请稍后重试',
    });
  }
});

module.exports = router;

