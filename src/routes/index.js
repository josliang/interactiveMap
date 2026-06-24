// 路由聚合
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/healthController');
const bossCtrl = require('../controllers/bossController');

// 健康检查
router.get('/health', ctrl.health);

// WebSocket 服务状态
router.get('/status', ctrl.status);

// Boss 刷新率
router.get('/bosses', bossCtrl.getBosses);
router.post('/bosses/refresh', bossCtrl.refreshBosses);

module.exports = router;
