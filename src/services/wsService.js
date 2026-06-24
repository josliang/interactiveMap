const WebSocket = require('ws');
const config = require('../config');
const logger = require('../utils/logger');
const bossService = require('./bossService');

class WsService {
  constructor () {
    this.wss = null;
    this.drawLineCache = [];
    this.heartbeatTimer = null;
  }

  attach (server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on('connection', (ws, req) => this._onConnection(ws, req));
    this._startHeartbeat();
    this._scheduleClearCache();
    logger.info('WebSocket 服务已挂载');
  }

  _onConnection (ws, req) {
    const clientIP = req.socket.remoteAddress;
    logger.info(`Client connected: ${clientIP}`);

    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    if (this.drawLineCache.length > 0) {
      ws.send(JSON.stringify({
        type: 'broadcast',
        data: {
          category: 'initLines',
          value: this.drawLineCache,
        },
      }));
    }

    if (this.wss.clients.size === 1) {
      bossService.start((cache) => {
        this.broadcast({
          type: 'broadcast',
          data: { category: 'boss', value: cache },
        });
      });
    }

    const bossCache = bossService.getCache();
    if (bossCache.maps.length > 0) {
      ws.send(JSON.stringify({
        type: 'broadcast',
        data: { category: 'boss', value: bossCache },
      }));
    }

    ws.on('message', (raw) => this._onMessage(ws, raw));
    ws.on('close', () => {
      logger.info(`Client disconnected: ${clientIP}`);
      if (this.wss && this.wss.clients.size === 0) {
        bossService.stop();
      }
    });
    ws.on('error', (err) => logger.error('WebSocket error:', err.message));
  }

  _onMessage (ws, raw) {
    let message;
    try {
      message = JSON.parse(raw);
    } catch (err) {
      logger.error('解析消息失败:', err.message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Message must be valid JSON',
      }));
      return;
    }

    if (message.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
    }

    if (!this._isValidMessage(message)) {
      logger.warn('无效消息格式:', message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
      return;
    }

    if (message.category === 'line') {
      this.drawLineCache.push(message.value);
      if (this.drawLineCache.length > config.ws.maxLineCache) {
        this.drawLineCache.shift();
      }
    } else if (message.category === 'clearLines') {
      this.drawLineCache = [];
    }

    this.broadcast({
      type: 'broadcast',
      data: message,
    }, ws);
  }

  _isValidMessage (msg) {
    return (
      typeof msg === 'object' &&
      typeof msg.category === 'string' &&
      typeof msg.value === 'object'
    );
  }

  broadcast (payload, excludeWs = null) {
    if (!this.wss) return;
    const data = JSON.stringify(payload);
    this.wss.clients.forEach((client) => {
      if (client === excludeWs) return;
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(data);
    });
  }

  pushToAll (category, value) {
    this.broadcast({ type: 'broadcast', data: { category, value } });
  }

  _startHeartbeat () {
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          logger.warn('Terminating stale client');
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, config.ws.heartbeatInterval);

    this.wss.on('close', () => clearInterval(this.heartbeatTimer));
  }

  _scheduleClearCache () {
    const now = new Date();
    const next = new Date();
    next.setHours(config.ws.clearHour, 0, 0, 0);
    if (now > next) next.setDate(next.getDate() + 1);

    setTimeout(() => {
      this.drawLineCache = [];
      logger.info('[清空] drawLine 缓存');
      this._scheduleClearCache();
    }, next - now);
  }

  getStatus () {
    return {
      clientCount: this.wss ? this.wss.clients.size : 0,
      cacheSize: this.drawLineCache.length,
    };
  }
}

module.exports = new WsService();
