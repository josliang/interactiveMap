// 服务入口：创建 HTTPS 服务并挂载 WebSocket
// 本地调试无证书时，设置 USE_HTTP=1 回退为 HTTP
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = require('./app');
const config = require('./config');
const wsService = require('./services/wsService');
const logger = require('./utils/logger');

const useHttp = process.env.USE_HTTP === '1';
let server;

if (useHttp) {
  // HTTP 模式 (本地调试)
  server = http.createServer(app);
  logger.warn('USE_HTTP=1，已回退为 HTTP 模式，仅供本地调试');
} else {
  // HTTPS 模式 (生产)
  if (!config.ssl.keyPath || !config.ssl.certPath) {
    logger.error('请在 .env 中配置 SSL_KEY_PATH 与 SSL_CERT_PATH，或设置 USE_HTTP=1 进入本地调试模式');
    process.exit(1);
  }
  const options = {
    key: fs.readFileSync(config.ssl.keyPath, 'utf8'),
    cert: fs.readFileSync(config.ssl.certPath, 'utf8'),
  };
  server = https.createServer(options, app);
}

// 将 WebSocket 挂载到同一服务
wsService.attach(server);

server.listen(config.port, () => {
  const proto = useHttp ? 'http' : 'https';
  logger.info(`${proto.toUpperCase()} + WebSocket 服务已启动: ${proto}://0.0.0.0:${config.port}`);
  logger.info(`环境: ${config.nodeEnv}`);
});

// 优雅退出
const shutdown = (signal) => {
  logger.info(`收到 ${signal}，开始关闭服务...`);
  server.close(() => {
    logger.info('HTTP 服务已关闭');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  logger.error('未处理的 Promise 异常:', err);
});
process.on('uncaughtException', (err) => {
  logger.error('未捕获异常:', err);
  process.exit(1);
});
