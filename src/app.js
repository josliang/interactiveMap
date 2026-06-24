const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/api', routes);

const fs = require('fs');
const PUBLIC_CANDIDATES = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../web/dist'),
];
const PUBLIC_DIR = PUBLIC_CANDIDATES.find(p => fs.existsSync(p));

if (PUBLIC_DIR) {
  logger.info(`前端静态资源目录: ${PUBLIC_DIR}`);
  app.use('/tar-im', express.static(PUBLIC_DIR, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (/\.(js|css|woff2?|png|jpg|jpeg|svg|webp)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));
  app.get('/', (req, res) => res.redirect('/tar-im/'));
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
  app.get('/', (req, res) => {
    res.json({ name: 'tarkov-map-server', version: '1.0.0' });
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
