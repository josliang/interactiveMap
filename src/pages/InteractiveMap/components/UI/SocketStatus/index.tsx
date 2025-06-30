import { useWs } from '@/components/WsContext';

import './style.less';

const Index = () => {
  const { connected } = useWs();

  return (
    <div className="im-socketStatus">
      <span>服务器：</span><span className={connected ? 'connected' : 'disconnected'}>{connected ? '已连接' : '已断开'}</span>
    </div>
  );
};

export default Index;
