/**
 * 服务器入口文件
 * 中国监狱历史文化展览馆智慧预约与文化传播平台
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./db/database');

// 导入路由
const bookingRoutes = require('./routes/booking');
const userRoutes = require('./routes/user');
const hallRoutes = require('./routes/hall');
const adminRoutes = require('./routes/admin');
const arRoutes = require('./routes/ar');
const collectionRoutes = require('./routes/collection');
const gameRoutes = require('./routes/game');
const certificateRoutes = require('./routes/certificate');
const feedbackRoutes = require('./routes/feedback');
const openDaysRoutes = require('./routes/open-days');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
// 云托管会自动分配端口，通过环境变量 PORT 获取
// 云托管默认端口是 80，本地开发使用 3000
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3000);

// 确保必要的目录存在
// 云托管环境使用 /tmp 目录，本地开发使用相对路径
const isCloud = process.env.TCB_ENV || process.env.TENCENTCLOUD_RUNENV;
const baseDir = isCloud ? '/tmp' : __dirname;
const dirs = isCloud 
  ? ['/tmp/uploads', '/tmp/uploads/images', '/tmp/uploads/audio']
  : ['./data', './uploads', './uploads/images', './uploads/audio'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// 静态文件服务
// 云托管环境使用 /tmp/uploads，本地开发使用相对路径
const uploadsDir = isCloud ? '/tmp/uploads' : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// 健康检查 - 必须在所有路由之前，确保快速响应
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径健康检查（兼容性）
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/booking', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hall', hallRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ar', arRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/open-days', openDaysRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理
app.use(errorHandler);

// 数据库初始化状态
let dbReady = false;

// 先启动服务器，让健康检查立即可用
// 监听 0.0.0.0 确保可以从外部访问（云托管要求）
app.listen(PORT, '0.0.0.0', () => {
  const env = process.env.NODE_ENV || 'development';
  const isCloud = process.env.TCB_ENV || process.env.TENCENTCLOUD_RUNENV;
  const serverType = isCloud ? '云托管服务器' : '本地服务器';
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  中国监狱历史文化展览馆智慧预约平台 - ${serverType}          ║
║                                                           ║
║  服务器已启动: 端口 ${PORT}                                  ║
║  环境: ${env}                                             ║
║  运行环境: ${isCloud ? '云托管' : '本地'}                    ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  // 服务器启动后，在后台异步初始化数据库
  // 数据库初始化不影响健康检查
  console.log('正在初始化数据库...');
  initDatabase()
    .then(() => {
      dbReady = true;
      console.log('✅ 数据库初始化完成');
    })
    .catch((err) => {
      console.warn('⚠️ 数据库初始化失败，服务将继续运行:', err.message);
      // 不退出进程，服务继续运行，但某些功能可能不可用
      dbReady = false;
    });
});

module.exports = app;

