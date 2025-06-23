import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { wsInstance } from '@/utils/socket';

type WsContextType = typeof wsInstance;

const WsContext = createContext<WsContextType | null>(null);

export const WsProvider = ({ children }: { children: React.ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const latestUserMessages = useRef<Map<string, any>>(new Map());
  const writeLock = useRef(false); // 防止频繁写入

  // 节流写入 localStorage，每秒最多一次
  const throttleWriteToLocalStorage = () => {
    if (writeLock.current) return;
    writeLock.current = true;

    const obj: Record<string, any> = {};
    latestUserMessages.current.forEach((value, key) => {
      obj[key] = value;
    });
    (window as any).interactUpdateOtherLocation(obj);

    setTimeout(() => {
      writeLock.current = false;
    }, 1000); // 1秒节流
  };

  useEffect(() => {
    wsInstance.init();

    const checkConnected = setInterval(() => {
      if (wsInstance.socketStatus) {
        setConnected(true);
        clearInterval(checkConnected);
      }
    }, 500);

    const handleMessage = (data: any) => {
      if (!data?.username) return;
      latestUserMessages.current.set(data.username, data);
      throttleWriteToLocalStorage();
    };

    wsInstance.onMessage(handleMessage);

    return () => {
      clearInterval(checkConnected);
      console.log('socket状态', connected);
      wsInstance.offMessage(handleMessage);
      wsInstance.ws?.close();
    };
  }, []);

  return <WsContext.Provider value={wsInstance}>{children}</WsContext.Provider>;
};

export const useWs = () => {
  const context = useContext(WsContext);
  if (context === null) {
    throw new Error('useWs must be used within a WsProvider');
  }
  return context;
};
