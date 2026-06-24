const bossService = require('../services/bossService');

exports.getBosses = (req, res) => {
  res.json(bossService.getCache());
};

exports.refreshBosses = async (req, res) => {
  await bossService.refresh();
  res.json(bossService.getCache());
};
