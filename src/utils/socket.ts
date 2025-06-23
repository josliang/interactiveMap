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

  onMessage(fn: MessageListener) {
    this.listeners.add(fn);
  }

  offMessage(fn: MessageListener) {
    this.listeners.delete(fn);
  }

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = this.onclose.bind(this);
    this.ws.onerror = this.onerror.bind(this);
  }

  init(): Promise<void> {
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
            toast.error('socket服务器连接失败');
            this.once = true;
          }
          reject(new Error('网络异常'));
        }
        connectionCount++;
      }, 1000);
    });
  }

  onopen(): void {
    console.log('websocket连接成功', this.ws);
    this.socketStatus = true;
    this.lastPongTimestamp = Date.now();
    this.startHeartbeat();
  }

  onmessage(e: MessageEvent): void {
    const data: WebSocketMessage = getJsonParse(e.data);

    if (data?.type === 'pong') {
      this.lastPongTimestamp = Date.now();
      return;
    }

    if (
      data?.type === 'broadcast' &&
      data.data?.username &&
      data.data?.filename &&
      data.data?.updatedAt
    ) {
      this.listeners.forEach((fn) => fn(data.data));
    } else {
      console.warn('接收到无效消息，已忽略:', data);
    }
  }

  onclose(): void {
    console.log(':::websocket连接关闭:::');
    this.socketStatus = false;
    this.stopHeartbeat();
  }

  onerror(e: Event): void {
    console.log(':::websocket连接失败:::', e);
    this.socketStatus = false;
    this.stopHeartbeat();
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.socketStatus) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    // 启动心跳发送
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.socketStatus) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatTimeout);

    // 启动pong检查
    this.pongTimeoutChecker = setInterval(() => {
      const now = Date.now();
      if (now - this.lastPongTimestamp > this.heartbeatTimeout * 2) {
        console.error('心跳超时，刷新页面');
        this.closeAndReload();
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

  private closeAndReload() {
    this.ws?.close();
    this.stopHeartbeat();
    this.socketStatus = false;
    window.location.reload(); // 仅心跳异常时刷新页面
  }
}

export const wsInstance = new Ws();
