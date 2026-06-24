// WebSocket 服务：广播中转 + 绘图缓存 + 心跳
// 协议保持与原 app.js 一致，前端无需改动
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

  // 挂载到已有的 HTTP(S) server
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

    // 首次连接推送全量绘图缓存
    if (this.drawLineCache.length > 0) {
      ws.send(JSON.stringify({
        type: 'broadcast',
        data: {
          category: 'initLines',
          value: this.drawLineCache,
        },
      }));
    }

    // 第一个客户端连入 → 启动 Boss 轮询
    if (this.wss.clients.size === 1) {
      bossService.start((cache) => {
        this.broadcast({
          type: 'broadcast',
          data: { category: 'boss', value: cache },
        });
      });
    }

    // 立即给当前客户端发送已有 Boss 缓存
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
      // 最后一个客户端离开 → 停止 Boss 轮询
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

    // 心跳协议
    if (message.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
    }

    // 业务消息校验
    if (!this._isValidMessage(message)) {
      logger.warn('无效消息格式:', message);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
      return;
    }

    // 绘图数据缓存
    if (message.category === 'line') {
      this.drawLineCache.push(message.value);
      if (this.drawLineCache.length > config.ws.maxLineCache) {
        this.drawLineCache.shift();
      }
    } else if (message.category === 'clearLines') {
      this.drawLineCache = [];
    }

    // 广播给其他客户端
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

  // 广播消息，可选排除某个客户端
  broadcast (payload, excludeWs = null) {
    if (!this.wss) return;
    const data = JSON.stringify(payload);
    this.wss.clients.forEach((client) => {
      if (client === excludeWs) return;
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(data);
    });
  }

  // 主动向所有客户端推送
  pushToAll (category, value) {
    this.broadcast({ type: 'broadcast', data: { category, value } });
  }

  // 心跳检测：清理僵尸连接
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

  // 每日定时清空缓存
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

  // 给 HTTP 接口暴露当前状态
  getStatus () {
    return {
      clientCount: this.wss ? this.wss.clients.size : 0,
      cacheSize: this.drawLineCache.length,
    };
  }
}

module.exports = new WsService();
