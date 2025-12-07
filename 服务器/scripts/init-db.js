/**
 * 数据库初始化脚本
 */

require('dotenv').config();
const { initDatabase, db } = require('../db/database');

async function main() {
  console.log('开始初始化数据库...');
  
  try {
    await initDatabase();
    console.log('数据库初始化完成！');
    
    // 可以在这里添加初始数据
    // 例如：创建测试用户、添加展区数据等
    
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

main();

