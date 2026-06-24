// Express 应用实例
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

// 基础中间件
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// 路由
app.use('/api', routes);

// 前端静态资源托管
// 查找顺序: ../public (生产打包 dist/public) -> ../web/dist (开发模式)
const fs = require('fs');
const PUBLIC_CANDIDATES = [
  path.join(__dirname, '../public'),        // 生产: dist/public 或 root/public
  path.join(__dirname, '../web/dist'),      // 开发: root/web/dist
];
const PUBLIC_DIR = PUBLIC_CANDIDATES.find(p => fs.existsSync(p));

if (PUBLIC_DIR) {
  logger.info(`前端静态资源目录: ${PUBLIC_DIR}`);
  // 前端 base 为 /tar-im/，挂载到同名路径
  app.use('/tar-im', express.static(PUBLIC_DIR, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (/\.(js|css|woff2?|png|jpg|jpeg|svg|webp)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));
  // 根路径重定向到前端入口
  app.get('/', (req, res) => res.redirect('/tar-im/'));
  // SPA history fallback: /tar-im/* 未命中静态资源时返回 index.html
  app.get(/^\/tar-im(\/.*)?$/, (req, res, next) => {
    const indexFile = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      next();
    }
  });
} else {
  logger.warn('未找到前端静态资源目录 (server/public 或 web/dist)，前端路由不可用');
  // 未集成前端时根路径返回服务信息
  app.get('/', (req, res) => {
    res.json({ name: 'tarkov-map-server', version: '1.0.0' });
  });
}

// 错误兜底
app.use(notFound);
app.use(errorHandler);

module.exports = app;
