// 配置中心：统一读取环境变量，提供默认值
require('dotenv').config();

const config = {
  port: process.env.PORT || 8001,
  nodeEnv: process.env.NODE_ENV || 'development',
  ssl: {
    keyPath: process.env.SSL_KEY_PATH,
    certPath: process.env.SSL_CERT_PATH,
  },
  ws: {
    heartbeatInterval: 30000, // 心跳检测间隔
    maxLineCache: 100,        // 绘图缓存上限
    clearHour: 6,             // 每日清空缓存时刻 (0-23)
  },
};

module.exports = config;
