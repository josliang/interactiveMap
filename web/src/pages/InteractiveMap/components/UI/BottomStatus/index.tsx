import { useMemo } from 'react';

import { useWs } from '@/components/WsContext';

import './style.less';

interface BottomStatusProps {
  position: InteractiveMap.Position2D;
  image2realPos?: InteractiveMap.ImageTransformProps;
}

// 右下角状态指示器：坐标 + WebSocket 连接状态点
const Index = (props: BottomStatusProps) => {
  const { position, image2realPos } = props;
  const { connected } = useWs();

  const realPosition = useMemo(() => {
    return image2realPos?.p(position) || { x: 0, y: 0 };
  }, [position, image2realPos]);

  return (
    <div className="im-bottomstatus">
      <span className="im-bottomstatus-coordinate">
        {realPosition.x.toFixed(1)}, {realPosition.y.toFixed(1)}
      </span>
      <span
        className={`im-bottomstatus-dot ${connected ? 'connected' : 'disconnected'}`}
        title={connected ? '已连接' : '已断开'}
      />
    </div>
  );
};

export default Index;
