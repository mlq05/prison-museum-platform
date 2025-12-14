// cloudfunctions/getARUrl/index.js
// 获取AR页面URL的云函数

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

/**
 * 获取AR页面URL
 * @param {string} hallId - 展区ID
 * @returns {string} AR页面URL
 */
exports.main = async (event, context) => {
  const { hallId } = event;
  const wxContext = cloud.getWXContext();
  
  console.log('getARUrl云函数调用:', { hallId, openId: wxContext.OPENID });
  
  try {
    // 从云开发环境获取静态网站托管域名
    // 方式1：从环境变量获取（推荐）
    // 在云开发控制台 -> 设置 -> 环境变量中配置 HOSTING_URL
    // 方式2：直接配置（如果环境变量不可用）
    // 已配置为实际云环境ID对应的静态网站托管域名
    // 域名获取方式：云开发控制台 -> 静态网站托管 -> 基础配置 -> 默认域名
    const hostingUrl = process.env.HOSTING_URL || 'https://cloud1-6glt083780b46f82-1390050511.tcloudbaseapp.com';
    
    // 构建AR页面URL
    const arPageUrl = `${hostingUrl}/ar-pages/marker-ar-simple.html?hallId=${hallId}`;
    
    // 生成二维码URL（使用第三方服务）
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arPageUrl)}`;
    
    return {
      success: true,
      data: {
        arUrl: arPageUrl,
        qrCodeUrl: qrCodeUrl,
        hostingUrl: hostingUrl,
      },
    };
  } catch (error) {
    console.error('getARUrl云函数错误:', error);
    return {
      success: false,
      message: error.message || '获取AR URL失败',
    };
  }
};