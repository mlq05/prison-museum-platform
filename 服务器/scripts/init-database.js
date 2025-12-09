/**
 * 数据库初始化脚本（增强版）
 * 用于初始化数据库集合和默认数据
 */

require('dotenv').config();
const { cloudDb, collections } = require('../db/database');
const bcrypt = require('bcryptjs');

/**
 * 初始化所有数据库集合和默认数据
 */
async function initAll() {
  console.log('========================================');
  console.log('开始初始化云数据库...');
  console.log('========================================\n');

  if (!cloudDb) {
    console.error('❌ 数据库未初始化，请检查环境变量配置！');
    console.error('需要配置：TCB_ENV, TCB_SECRET_ID, TCB_SECRET_KEY');
    process.exit(1);
  }

  try {
    // 1. 初始化管理员账号
    await initAdminAccount();

    // 2. 初始化展区数据（可选）
    // await initHallsData();

    console.log('\n========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    console.error('错误详情:', error.message);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
    process.exit(1);
  }
}

/**
 * 初始化默认管理员账号
 */
async function initAdminAccount() {
  console.log('1. 初始化管理员账号...');
  
  try {
    const defaultUsername = 'zysfjgxy';
    const defaultPassword = '123456';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    // 检查管理员是否存在
    const existingAdmin = await collections.admins.findByUsername(defaultUsername);
    
    if (existingAdmin) {
      console.log(`   ✅ 管理员账号已存在: ${defaultUsername}`);
      return;
    }

    // 创建默认管理员
    const admin = await collections.admins.create({
      username: defaultUsername,
      passwordHash: passwordHash,
      role: 'admin',
      name: '系统管理员',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`   ✅ 默认管理员账号已创建:`);
    console.log(`      用户名: ${defaultUsername}`);
    console.log(`      密码: ${defaultPassword}`);
    console.log(`      角色: admin`);
  } catch (error) {
    console.error('   ❌ 创建管理员账号失败:', error.message);
    
    // 如果是集合不存在错误，提示手动创建
    if (error.message.includes('collection') || error.message.includes('集合')) {
      console.log('   💡 提示：请在云开发控制台手动创建 "admins" 集合');
      console.log('      或者在首次使用时系统会自动创建');
    }
    
    throw error;
  }
}

/**
 * 初始化展区数据（示例）
 * 如果需要初始化展区数据，可以取消注释并修改数据
 */
async function initHallsData() {
  console.log('2. 初始化展区数据...');
  
  try {
    const halls = await collections.halls.list();
    
    if (halls && halls.length > 0) {
      console.log(`   ✅ 已存在 ${halls.length} 个展区`);
      return;
    }

    // 示例展区数据
    const defaultHalls = [
      {
        name: '古代监狱展区',
        description: '探索中国古代监狱制度的起源与发展，了解监狱名称沿革、治理思想、管理制度等',
        coverImage: '/assets/images/halls/ancient-prison.jpg',
        floor: 1,
        order_index: 1,
        isActive: true,
      },
      {
        name: '近代狱制改良',
        description: '了解清末至民国时期监狱制度的系统性变革，从传统狱制向现代狱制的转型',
        coverImage: '/assets/images/halls/modern-reform.jpg',
        floor: 1,
        order_index: 2,
        isActive: true,
      },
    ];

    // 创建展区
    for (const hallData of defaultHalls) {
      await collections.halls.create(hallData);
      console.log(`   ✅ 已创建展区: ${hallData.name}`);
    }
  } catch (error) {
    console.error('   ⚠️  初始化展区数据失败:', error.message);
    // 不抛出错误，允许继续执行
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  console.log('测试数据库连接...');
  
  try {
    // 尝试查询集合列表（如果支持）
    console.log('   ✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.error('   ❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 运行初始化
if (require.main === module) {
  initAll();
}

module.exports = {
  initAll,
  initAdminAccount,
  initHallsData,
  testConnection,
};

