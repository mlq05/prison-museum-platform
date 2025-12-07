/**
 * 数据库集合操作服务层
 * 封装所有数据库集合的CRUD操作，使用云数据库API
 */

// 延迟获取 cloudDb，避免循环依赖
function getCloudDb() {
  // 避免循环依赖：动态获取 database 模块
  const database = require('./database');
  return database.cloudDb;
}

/**
 * 用户集合操作
 */
const usersCollection = {
  /**
   * 根据openId查询用户
   */
  async findByOpenId(openId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      const error = new Error('数据库未初始化，请检查环境变量 TCB_ENV, TCB_SECRET_ID, TCB_SECRET_KEY 是否配置正确');
      console.error('❌ 数据库操作失败:', error.message);
      throw error;
    }
    
    try {
      const result = await cloudDb.collection('users')
        .where({ openId })
        .get();
      
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  },

  /**
   * 创建用户
   */
  async create(userData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await cloudDb.collection('users').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户信息
   */
  async update(openId, updateData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...updateData,
      updatedAt: now,
    };

    try {
      await cloudDb.collection('users')
        .where({ openId })
        .update(data);
      
      return await this.findByOpenId(openId);
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  },

  /**
   * 查询用户列表（管理员功能）
   */
  async list(page = 1, pageSize = 20, filters = {}) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      let query = cloudDb.collection('users');

      // 应用过滤条件
      if (filters.role) {
        query = query.where({ role: filters.role });
      }
      if (filters.verified !== undefined) {
        query = query.where({ verified: filters.verified });
      }

      // 获取总数
      const countResult = await query.count();
      const total = countResult.total || 0;

      // 获取列表（分页）
      const skip = (page - 1) * pageSize;
      const result = await query
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();

      return {
        list: result.data || [],
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询用户列表失败:', error);
      throw error;
    }
  },
};

/**
 * 管理员集合操作
 */
const adminsCollection = {
  /**
   * 根据用户名查询管理员
   */
  async findByUsername(username) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('admins')
        .where({ username })
        .get();
      
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('查询管理员失败:', error);
      throw error;
    }
  },

  /**
   * 创建管理员
   */
  async create(adminData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...adminData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await cloudDb.collection('admins').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建管理员失败:', error);
      throw error;
    }
  },

  /**
   * 更新管理员信息
   */
  async update(adminId, updateData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...updateData,
      updatedAt: now,
    };

    try {
      await cloudDb.collection('admins')
        .doc(adminId)
        .update(data);
      
      const result = await cloudDb.collection('admins')
        .doc(adminId)
        .get();
      
      return result.data || null;
    } catch (error) {
      console.error('更新管理员失败:', error);
      throw error;
    }
  },

  /**
   * 查询管理员列表
   */
  async list(page = 1, pageSize = 20) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const countResult = await cloudDb.collection('admins').count();
      const total = countResult.total || 0;

      const skip = (page - 1) * pageSize;
      const result = await cloudDb.collection('admins')
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();

      return {
        list: result.data || [],
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询管理员列表失败:', error);
      throw error;
    }
  },
};

/**
 * 预约集合操作
 */
const bookingsCollection = {
  /**
   * 创建预约
   */
  async create(bookingData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...bookingData,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await cloudDb.collection('bookings').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建预约失败:', error);
      // 检查是否是集合不存在错误
      if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND')) {
        const enhancedError = new Error('数据库集合 "bookings" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * 根据ID查询预约
   */
  async findById(bookingId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('bookings')
        .doc(bookingId)
        .get();
      
      return result.data || null;
    } catch (error) {
      console.error('查询预约失败:', error);
      throw error;
    }
  },

  /**
   * 查询用户预约列表
   */
  async listByUser(userId, filters = {}) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const { status, page = 1, pageSize = 10 } = filters;
      
      let query = cloudDb.collection('bookings').where({ userId });

      if (status && status !== 'all') {
        query = query.where({ status });
      }

      // 获取总数
      const countResult = await query.count();
      const total = countResult.total || 0;

      // 获取列表
      const skip = (page - 1) * pageSize;
      const result = await query
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();

      return {
        list: result.data || [],
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询预约列表失败:', error);
      // 检查是否是集合不存在错误
      if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND')) {
        const enhancedError = new Error('数据库集合 "bookings" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * 查询所有预约列表（管理员功能）
   */
  async listAll(filters = {}) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const { status, startDate, endDate, keyword, page = 1, pageSize = 20 } = filters;
      
      // 先构建基础查询（不使用 orderBy，避免索引问题）
      let query = cloudDb.collection('bookings');

      if (status && status !== 'all') {
        query = query.where({ status });
      }

      // 日期范围查询：由于 CloudBase 限制，先查询所有数据，然后在内存中过滤
      // 为了避免数据量过大，如果提供了日期范围，先使用日期过滤
      let allBookings;
      if (startDate || endDate) {
        // 如果有日期范围，先查询所有状态的数据，然后在内存中过滤
        const baseQuery = cloudDb.collection('bookings');
        let tempQuery = baseQuery;
        if (status && status !== 'all') {
          tempQuery = tempQuery.where({ status });
        }
        
        const tempResult = await tempQuery.get();
        allBookings = (tempResult.data || []).filter(booking => {
          if (startDate && booking.bookingDate < startDate) {
            return false;
          }
          if (endDate && booking.bookingDate > endDate) {
            return false;
          }
          return true;
        });
      } else {
        // 没有日期范围，直接查询
        const result = await query.get();
        allBookings = result.data || [];
      }

      console.log('查询到的预约总数（过滤前）:', allBookings.length);

      // 关键词搜索（在内存中过滤）
      if (keyword) {
        allBookings = allBookings.filter(item => 
          (item.userName && item.userName.includes(keyword)) ||
          (item.phone && item.phone.includes(keyword))
        );
        console.log('关键词过滤后的预约数:', allBookings.length);
      }

      // 在内存中排序（按创建时间倒序）
      allBookings.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return timeB - timeA; // 倒序
      });

      // 获取总数
      const total = allBookings.length;

      // 内存分页
      const skip = (page - 1) * pageSize;
      const list = allBookings.slice(skip, skip + pageSize);

      console.log('分页结果:', {
        total,
        skip,
        pageSize,
        listLength: list.length,
        sampleBooking: list.length > 0 ? {
          _id: list[0]._id,
          userName: list[0].userName,
          bookingDate: list[0].bookingDate,
          status: list[0].status
        } : null
      });

      return {
        list,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询预约列表失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  },

  /**
   * 查询指定日期范围的预约（用于日历）
   */
  async listByDateRange(startDate, endDate) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      // CloudBase 数据库查询：日期范围查询
      // 先查询所有满足状态条件的记录，然后在内存中过滤日期范围
      // 因为 CloudBase 不支持在单个字段上同时使用 gte 和 lte
      const allBookings = await cloudDb.collection('bookings')
        .where({
          status: cloudDb.command.in(['pending', 'approved']),
        })
        .get();

      // 在内存中过滤日期范围
      const bookings = (allBookings.data || []).filter(booking => {
        return booking.bookingDate >= startDate && booking.bookingDate <= endDate;
      });

      return bookings;
    } catch (error) {
      console.error('查询预约日历失败:', error);
      console.error('查询参数:', { startDate, endDate });
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      // 检查是否是集合不存在错误
      if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND')) {
        const enhancedError = new Error('数据库集合 "bookings" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * 更新预约状态
   */
  async updateStatus(bookingId, status, reviewInfo = {}) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const updateData = {
      status,
      updatedAt: now,
      ...reviewInfo,
    };

    try {
      await cloudDb.collection('bookings')
        .doc(bookingId)
        .update(updateData);
      
      return await this.findById(bookingId);
    } catch (error) {
      console.error('更新预约状态失败:', error);
      throw error;
    }
  },

  /**
   * 统计指定日期和时段的预约人数
   */
  async countByDateAndTimeSlot(bookingDate, bookingTimeSlot) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('bookings')
        .where({
          bookingDate,
          bookingTimeSlot,
          status: cloudDb.command.in(['pending', 'approved']),
        })
        .get();

      const bookings = result.data || [];
      const totalCount = bookings.reduce((sum, booking) => sum + (booking.visitorCount || 0), 0);

      return {
        bookings,
        totalCount,
      };
    } catch (error) {
      console.error('统计预约人数失败:', error);
      throw error;
    }
  },
};

/**
 * 展区集合操作
 */
const hallsCollection = {
  /**
   * 查询所有展区列表
   */
  async list() {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('halls')
        .where({ isActive: true })
        .orderBy('order_index', 'asc')
        .orderBy('floor', 'asc')
        .get();

      return result.data || [];
    } catch (error) {
      console.error('查询展区列表失败:', error);
      throw error;
    }
  },

  /**
   * 根据ID查询展区详情
   */
  async findById(hallId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('halls')
        .doc(hallId)
        .get();
      
      return result.data || null;
    } catch (error) {
      console.error('查询展区详情失败:', error);
      throw error;
    }
  },

  /**
   * 创建展区
   */
  async create(hallData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...hallData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await cloudDb.collection('halls').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建展区失败:', error);
      throw error;
    }
  },

  /**
   * 更新展区信息
   */
  async update(hallId, updateData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...updateData,
      updatedAt: now,
    };

    try {
      await cloudDb.collection('halls')
        .doc(hallId)
        .update(data);
      
      return await this.findById(hallId);
    } catch (error) {
      console.error('更新展区失败:', error);
      throw error;
    }
  },

  /**
   * 删除展区（软删除）
   */
  async delete(hallId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      await cloudDb.collection('halls')
        .doc(hallId)
        .update({
          isActive: false,
          updatedAt: Date.now(),
        });
      
      return true;
    } catch (error) {
      console.error('删除展区失败:', error);
      throw error;
    }
  },
};

/**
 * 反馈集合操作
 */
const feedbacksCollection = {
  /**
   * 创建反馈
   */
  async create(feedbackData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...feedbackData,
      status: 'approved', // 自动审核通过，可以在互动墙显示
      createdAt: now,
    };

    try {
      const result = await cloudDb.collection('feedbacks').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建反馈失败:', error);
      // 检查是否是集合不存在错误
      if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND')) {
        const enhancedError = new Error('数据库集合 "feedbacks" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * 查询用户反馈列表
   */
  async listByUser(userId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('feedbacks')
        .where({ userId })
        .orderBy('createdAt', 'desc')
        .get();

      return result.data || [];
    } catch (error) {
      console.error('查询反馈列表失败:', error);
      throw error;
    }
  },

  /**
   * 查询公开反馈列表（互动墙）
   */
  async listPublic(filters = {}) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const { page = 1, pageSize = 10 } = filters;
      
      let query = cloudDb.collection('feedbacks').where({ status: 'approved' });

      // 获取总数
      const countResult = await query.count();
      const total = countResult.total || 0;

      // 获取列表
      const skip = (page - 1) * pageSize;
      const result = await query
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();

      return {
        list: result.data || [],
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询公开反馈列表失败:', error);
      // 检查是否是集合不存在错误
      if (error.message && (error.message.includes('collection') || error.message.includes('集合') || error.code === 'COLLECTION_NOT_FOUND')) {
        const enhancedError = new Error('数据库集合 "feedbacks" 不存在，请在 CloudBase 控制台的"文档型数据库"中创建此集合');
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  },

  /**
   * 更新反馈状态
   */
  async updateStatus(feedbackId, status) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      await cloudDb.collection('feedbacks')
        .doc(feedbackId)
        .update({
          status,
          updatedAt: Date.now(),
        });
      
      const result = await cloudDb.collection('feedbacks')
        .doc(feedbackId)
        .get();
      
      return result.data || null;
    } catch (error) {
      console.error('更新反馈状态失败:', error);
      throw error;
    }
  },
};

/**
 * 收藏集合操作
 */
const collectionsCollection = {
  /**
   * 创建收藏
   */
  async create(collectionData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...collectionData,
      createdAt: now,
    };

    try {
      const result = await cloudDb.collection('collections').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建收藏失败:', error);
      throw error;
    }
  },

  /**
   * 查询用户收藏列表
   */
  async listByUser(userId, type = null) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      let query = cloudDb.collection('collections').where({ userId });

      if (type) {
        query = query.where({ type });
      }

      const result = await query
        .orderBy('createdAt', 'desc')
        .get();

      return result.data || [];
    } catch (error) {
      console.error('查询收藏列表失败:', error);
      throw error;
    }
  },

  /**
   * 删除收藏
   */
  async remove(collectionId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      await cloudDb.collection('collections')
        .doc(collectionId)
        .remove();
      
      return true;
    } catch (error) {
      console.error('删除收藏失败:', error);
      throw error;
    }
  },

  /**
   * 检查是否已收藏
   */
  async checkExists(userId, type, itemId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('collections')
        .where({
          userId,
          type,
          itemId,
        })
        .get();

      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('检查收藏失败:', error);
      throw error;
    }
  },
};

/**
 * 证书集合操作
 */
const certificatesCollection = {
  /**
   * 创建证书
   */
  async create(certificateData) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    const now = Date.now();
    const data = {
      ...certificateData,
      createdAt: now,
    };

    try {
      const result = await cloudDb.collection('certificates').add(data);
      return {
        _id: result.id,
        ...data,
      };
    } catch (error) {
      console.error('创建证书失败:', error);
      throw error;
    }
  },

  /**
   * 查询用户证书列表
   */
  async listByUser(userId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('certificates')
        .where({ userId })
        .orderBy('createdAt', 'desc')
        .get();

      return result.data || [];
    } catch (error) {
      console.error('查询证书列表失败:', error);
      throw error;
    }
  },

  /**
   * 根据ID查询证书
   */
  async findById(certificateId) {
    const cloudDb = getCloudDb();
    if (!cloudDb) {
      throw new Error('数据库未初始化');
    }

    try {
      const result = await cloudDb.collection('certificates')
        .doc(certificateId)
        .get();
      
      return result.data || null;
    } catch (error) {
      console.error('查询证书失败:', error);
      throw error;
    }
  },
};

module.exports = {
  users: usersCollection,
  admins: adminsCollection,
  bookings: bookingsCollection,
  halls: hallsCollection,
  feedbacks: feedbacksCollection,
  collections: collectionsCollection,
  certificates: certificatesCollection,
};

