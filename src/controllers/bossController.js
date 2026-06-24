// Boss 刷新率 HTTP 接口
const bossService = require('../services/bossService');

// GET /api/bosses  返回当前缓存的 Boss 刷新数据
exports.getBosses = (req, res) => {
  res.json(bossService.getCache());
};

// POST /api/bosses/refresh  手动触发刷新
exports.refreshBosses = async (req, res) => {
  await bossService.refresh();
  res.json(bossService.getCache());
};
