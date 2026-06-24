const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/healthController');
const bossCtrl = require('../controllers/bossController');

router.get('/health', ctrl.health);

router.get('/status', ctrl.status);

router.get('/bosses', bossCtrl.getBosses);
router.post('/bosses/refresh', bossCtrl.refreshBosses);

module.exports = router;
