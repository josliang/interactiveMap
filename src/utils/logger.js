// 简易日志工具，带时间戳与分级
const fmt = (level, ...args) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level}]`, ...args);
};

module.exports = {
  info: (...a) => fmt('INFO', ...a),
  warn: (...a) => fmt('WARN', ...a),
  error: (...a) => fmt('ERROR', ...a),
  debug: (...a) => {
    if (process.env.NODE_ENV !== 'production') fmt('DEBUG', ...a);
  },
};
