import { toast } from 'react-toastify';

import { getJsonParse } from './index';

interface WebSocketMessage {
  [key: string]: any;
}

type MessageListener = (data: WebSocketMessage) => void;

class Ws {
  ws: WebSocket | null = null;
  socketStatus = false;
  once = false;

  private listeners: Set<MessageListener> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout = 10000;
  private lastPongTimestamp = Date.now();
  private pongTimeoutChecker: NodeJS.Timeout | null = null;

  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectUrl = '';

  private shouldReconnect = true;

  onMessage(fn: MessageListener) {
    this.listeners.add(fn);
  }

  offMessage(fn: MessageListener) {
    this.listeners.delete(fn);
  }

  connect(url: string) {
    this.connectUrl = url;
    this.ws = new WebSocket(url);
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = this.onclose.bind(this);
    this.ws.onerror = this.onerror.bind(this);
  }

  init(): Promise<void> {
    this.shouldReconnect = true;
    return new Promise((resolve, reject) => {
      this.connect('wss://www.gzvirdyn.cn:8001');

      let connectionCount = 1;
      const timerID = setInterval(() => {
        console.log(`:::websocket尝试第${connectionCount}次连接...:::`);

        if (this.socketStatus) {
          clearInterval(timerID);
          resolve();
        } else if (connectionCount >= 3) {
          clearInterval(timerID);
          if (!this.once) {
            toast.error('socket服务器连接失败', { autoClose: 2000 });
            this.once = true;
          }
          reject(new Error('网络异常'));
        }
        connectionCount++;
      }, 1000);
    });
  }

  onopen(): void {
    console.log(':::websocket连接成功:::', this.ws);
    this.socketStatus = true;
    this.reconnectAttempts = 0;
    this.lastPongTimestamp = Date.now();
    this.startHeartbeat();
  }

  onmessage(e: MessageEvent): void {
    const data: WebSocketMessage = getJsonParse(e.data);

    if (data?.type === 'pong') {
      this.lastPongTimestamp = Date.now();
      return;
    }

    if (data?.type === 'broadcast' && data.data?.category && data.data?.value) {
      this.listeners.forEach((fn) => fn(data.data));
    } else {
      console.warn('接收到无效消息，已忽略:', data);
    }
  }

  onclose(): void {
    console.log(':::websocket连接关闭:::');
    this.socketStatus = false;
    this.stopHeartbeat();
    if (this.shouldReconnect) {
      this.tryReconnect();
    }
  }

  onerror(e: Event): void {
    console.log(':::websocket连接失败:::', e);
    this.socketStatus = false;
    this.stopHeartbeat();
    if (this.shouldReconnect) {
      this.tryReconnect();
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.socketStatus) {
      this.ws.send(JSON.stringify(message));
    }
  }

  allowReconnect() {
    this.shouldReconnect = true;
    this.init();
  }

  close() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.socketStatus) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatTimeout);

    this.pongTimeoutChecker = setInterval(() => {
      const now = Date.now();
      if (now - this.lastPongTimestamp > this.heartbeatTimeout * 2) {
        console.error('心跳超时，尝试重连');
        if (this.shouldReconnect) {
          this.tryReconnect();
        }
      }
    }, this.heartbeatTimeout);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.pongTimeoutChecker) {
      clearInterval(this.pongTimeoutChecker);
      this.pongTimeoutChecker = null;
    }
  }

  private tryReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.warn(`WebSocket断开，${delay / 1000}s后尝试重连...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectTimer = null;
      this.connect(this.connectUrl);
    }, delay);
  }
}

export const wsInstance = new Ws();
