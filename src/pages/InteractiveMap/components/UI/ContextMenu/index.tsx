import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import { useWs } from '@/components/WsContext';

import './style.less';

export let showContextMenu = (props: InteractiveMap.Position2D) => {
  console.log(props);
};

const Index = () => {
  const { ws } = useWs();

  const [position, setPosition] = useState<InteractiveMap.Position2D>({
    x: 0,
    y: 0,
  });
  const [show, setShow] = useState(false);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const clearCanvas = () => {
    (window as any).interactClearAllLocation();
    (window as any).interactClearAllDraw();
    const username = localStorage.getItem('im-username');
    ws.send({
      category: 'clearLines',
      value: {
        username,
      },
    });
    setShow(false);
  };

  useEffect(() => {
    showContextMenu = (props: InteractiveMap.Position2D) => {
      setPosition(props);
      setTimeout(() => setShow(true));
    };
  }, []);

  useEffect(() => {
    const documentClick = (e: MouseEvent) => {
      if (show && contextMenuRef.current) {
        const isClickInside = contextMenuRef.current.contains(e.target as Node);
        if (!isClickInside) {
          setShow(false);
        }
      }
    };
    document.addEventListener('click', documentClick);
    return () => {
      document.removeEventListener('click', documentClick);
    };
  }, [show]);

  return (
    <div
      className={classNames('im-contextmenu', {
        active: show,
      })}
      style={{
        left: position.x + 16,
        top: position.y - 16,
      }}
      ref={contextMenuRef}
    >
      <div className="im-contextmenu-item" onClick={() => clearCanvas()}>
        <span>清空画布</span>
      </div>
      {
        /*
        <div className="im-contextmenu-item" onClick={() => message.show({ content: '开发中...' })}>
          <span>添加至收藏</span>
        </div>
        */
      }
    </div>
  );
};

export default Index;
