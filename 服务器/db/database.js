/**
 * 数据库连接和初始化 - 使用云开发数据库
 */

let tcb;
let app;
let db;
let bcrypt;

try {
  tcb = require('@cloudbase/node-sdk');
  bcrypt = require('bcryptjs');

  // 初始化云开发（如果环境变量未设置，使用默认值）
  const envId = process.env.TCB_ENV || process.env.TENCENTCLOUD_RUNENV || 'prison-museum-dev-8e6hujc6eb768b';
  const secretId = process.env.TCB_SECRET_ID;
  const secretKey = process.env.TCB_SECRET_KEY;
  
  // 检查必要的环境变量
  if (!secretId || !secretKey) {
    console.error('❌ 数据库初始化失败：缺少必要的环境变量');
    console.error('   请检查以下环境变量是否已配置：');
    console.error('   - TCB_ENV (当前值:', envId, ')');
    console.error('   - TCB_SECRET_ID (当前值:', secretId ? '已设置' : '未设置', ')');
    console.error('   - TCB_SECRET_KEY (当前值:', secretKey ? '已设置' : '未设置', ')');
    console.error('   注意：环境变量名称必须是 TCB_SECRET_KEY（下划线），不是 TCB_SECRET KEY（空格）');
    db = null;
  } else {
    app = tcb.init({
      env: envId,
      secretId: secretId,
      secretKey: secretKey,
    });

    db = app.database();
    console.log('✅ 云数据库初始化成功');
    console.log('   环境ID:', envId);
    console.log('   SecretId:', secretId.substring(0, 8) + '...');
  }
} catch (error) {
  console.error('❌ 云数据库初始化失败:', error.message);
  console.error('   错误详情:', error);
  if (error.stack) {
    console.error('   堆栈:', error.stack);
  }
  // 如果初始化失败，创建一个空的db对象，避免服务无法启动
  db = null;
}

// 数据库操作封装（兼容原有SQLite接口，但实际使用云数据库）
const dbWrapper = {
  // 查询单条记录（兼容SQL语法，但实际使用云数据库）
  get: (sql, params, callback) => {
    // 如果db未初始化，返回错误
    if (!db) {
      const err = new Error('数据库未初始化');
      if (callback) {
        callback(err, null);
        return;
      }
      return Promise.reject(err);
    }
    
    // 这里需要将SQL转换为云数据库查询
    // 暂时返回空结果，避免服务崩溃
    console.warn('SQL查询暂未实现，需要迁移到云数据库API:', sql);
    if (callback) {
      callback(null, null);
    }
    return Promise.resolve(null);
  },

  // 查询多条记录（兼容SQL语法）
  all: (sql, params, callback) => {
    if (!db) {
      const err = new Error('数据库未初始化');
      if (callback) {
        callback(err, null);
        return;
      }
      return Promise.reject(err);
    }
    
    console.warn('SQL查询暂未实现，需要迁移到云数据库API:', sql);
    if (callback) {
      callback(null, []);
    }
    return Promise.resolve([]);
  },

  // 插入记录（兼容SQL语法）
  run: (sql, params, callback) => {
    if (!db) {
      const err = new Error('数据库未初始化');
      if (callback) {
        callback(err, null);
        return;
      }
      return Promise.reject(err);
    }
    
    console.warn('SQL插入暂未实现，需要迁移到云数据库API:', sql);
    if (callback) {
      callback(null, { lastID: Date.now(), changes: 0 });
    }
    return Promise.resolve({ lastID: Date.now(), changes: 0 });
  },
};

// 初始化数据库集合
const initDatabase = async () => {
  try {
    console.log('开始初始化云数据库集合...');

    if (!db) {
      console.warn('数据库未初始化，跳过初始化步骤');
      return Promise.resolve();
    }

    // 初始化默认管理员账号
    const now = Date.now();
    const defaultUsername = 'zysfjgxy';
    const defaultPassword = '123456';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    // 检查管理员是否存在
    try {
      const existingAdmin = await db.collection('admins')
        .where({ username: defaultUsername })
        .get();
      
      if (!existingAdmin.data || existingAdmin.data.length === 0) {
        await db.collection('admins').add({
          username: defaultUsername,
          passwordHash: passwordHash,
          role: 'admin',
          createdAt: now,
          updatedAt: now,
        });
        console.log('默认管理员账号已创建: zysfjgxy / 123456');
      }
    } catch (error) {
      console.warn('创建默认管理员失败（可能集合不存在）:', error.message);
    }

    console.log('云数据库集合初始化完成');
    return Promise.resolve();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    // 即使初始化失败，也继续启动服务
    return Promise.resolve();
  }
};

// 导出集合操作服务
const collections = require('./collections');

module.exports = {
  db: dbWrapper,
  initDatabase,
  // 导出原始db对象，供需要直接使用云数据库API的地方使用
  cloudDb: db,
  // 导出集合操作服务
  collections,
};
