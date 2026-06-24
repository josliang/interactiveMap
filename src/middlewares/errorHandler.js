// 统一错误处理中间件
const logger = require('../utils/logger');

// 404
exports.notFound = (req, res, next) => {
  res.status(404).json({ code: 404, message: `路径不存在: ${req.method} ${req.originalUrl}` });
};

// 兜底异常
exports.errorHandler = (err, req, res, next) => {
  logger.error('请求异常:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    code: status,
    message: err.message || '服务器内部错误',
  });
};
