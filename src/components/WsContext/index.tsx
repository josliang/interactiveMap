import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { wsInstance } from '@/utils/socket';

interface WsContextType {
  ws: typeof wsInstance;
  connected: boolean;
}

const WsContext = createContext<WsContextType | null>(null);

export const WsProvider = ({ children }: { children: React.ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const latestUserMessages = useRef<Map<string, any>>(new Map());
  const writeLock = useRef(false);

  const writeLocationToMapThrottle = () => {
    if (writeLock.current) return;
    writeLock.current = true;

    const obj: Record<string, any> = {};
    latestUserMessages.current.forEach((value, key) => {
      obj[key] = value;
    });
    (window as any).interactUpdateOtherLocation(obj);

    setTimeout(() => {
      writeLock.current = false;
    }, 1000);
  };

  const writeLineToMap = (data: any) => {
    (window as any).interactUpdateOtherDraw(data);
  };

  const switchActiveMap = (data: any) => {
    const { username, mapId } = data;
    const name = localStorage.getItem('im-username');
    if (name === username) (window as any).interactUpdateActiveMap(mapId);
  };

  useEffect(() => {
    wsInstance.init();

    const checkConnected = setInterval(() => {
      setConnected(wsInstance.socketStatus);
    }, 500);

    const handleMessage = (data: any) => {
      if (!data?.category) return;
      if (data.category === 'location') {
        const { username } = data.value;
        latestUserMessages.current.set(username, data.value);
        writeLocationToMapThrottle();
      } else if (data.category === 'line') {
        writeLineToMap([data.value]);
      } else if (data.category === 'initLines') {
        writeLineToMap(data.value);
      } else if (data.category === 'switchMap') {
        switchActiveMap(data.value);
      }
    };

    wsInstance.onMessage(handleMessage);

    return () => {
      clearInterval(checkConnected);
      wsInstance.offMessage(handleMessage);
    };
  }, []);

  return (
    <WsContext.Provider value={{ ws: wsInstance, connected }}>
      {children}
    </WsContext.Provider>
  );
};

export const useWs = () => {
  const context = useContext(WsContext);
  if (context === null) {
    throw new Error('useWs must be used within a WsProvider');
  }
  return context;
};
