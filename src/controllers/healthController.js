const wsService = require('../services/wsService');

exports.health = (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
};

exports.status = (req, res) => {
  res.json(wsService.getStatus());
};
