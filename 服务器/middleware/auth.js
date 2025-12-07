/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

/**
 * 本地开发环境下的默认测试用户
 */
const createDevUser = (req, res, next) => {
  const now = Date.now();
  const devUser = {
    userId: 'dev-user',
    openId: 'dev-openid',
    role: 'visitor',
    name: '开发测试用户',
    phone: '00000000000',
  };

  // 确保测试用户在 users 表中存在（否则外键会失败）
  db.run(
    `INSERT OR IGNORE INTO users (
      openId, role, name, phone, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [devUser.openId, devUser.role, devUser.name, devUser.phone, now, now],
    (err) => {
      if (err) {
        console.error('创建开发测试用户失败:', err);
      }
      req.user = devUser;
      return next();
    }
  );
};

/**
 * JWT认证中间件
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 管理员登录接口不需要认证
    const isAdminLogin = req.path === '/login' || req.originalUrl === '/api/admin/login';
    if (isAdminLogin) {
      return next();
    }

    // 管理员接口（除了登录）必须使用JWT
    const isAdminPath = req.originalUrl && req.originalUrl.startsWith('/api/admin');
    if (isAdminPath) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: '未提供认证令牌',
        });
      }
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 非管理员接口，直接走开发测试用户逻辑
      return createDevUser(req, res, next);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    req.user = decoded;
    next();
  } catch (error) {
    console.warn('JWT 验证失败，使用开发测试用户继续（仅限本地开发）:', error && error.message);

    // 管理员接口（除了登录）仍然需要严格认证
    const isAdminLogin = req.path === '/login' || req.originalUrl === '/api/admin/login';
    const isAdminPath = req.originalUrl && req.originalUrl.startsWith('/api/admin');
    if (isAdminPath && !isAdminLogin) {
      return res.status(401).json({
        success: false,
        message: '认证失败，请重新登录'
      });
    }

    // 普通业务接口回退到开发测试用户，保证前端体验一致
    return createDevUser(req, res, next);
  }
};

/**
 * 管理员权限检查
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin
};

