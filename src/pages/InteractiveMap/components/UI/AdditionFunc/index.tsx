import { useState } from 'react';
import { toast } from 'react-toastify';

import Icon from '@/components/Icon';
import { useWs } from '@/components/WsContext';

import './style.less';

interface AdditionfuncProps {
  isMobile: boolean;
}

const openPip = async () => {
  try {
    if (!('documentPictureInPicture' in window)) {
      toast.info('当前浏览器不支持实验性画中画', { autoClose: 2000 });
      return;
    }

    const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
      width: 500,
      height: 500,
    });

    const pipDoc = pipWindow.document;
    const style = pipDoc.createElement('style');
    style.textContent = `
      html, body {
        height: 100%;
        overflow: hidden;
      }
      * {
        margin: 0;
        padding: 0;
      }
    `;
    pipDoc.head.appendChild(style);

    const iframe = pipDoc.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.src = (window as any).location.href;

    pipDoc.body.appendChild(iframe);
  } catch (e) {
    toast.info('开启画中画失败，请刷新重试', { autoClose: 2000 });
  }
};

const handleGoQA = () => {
  const url = (window as any).location.href.replaceAll('interactive', 'qa');
  window.open(url, '_blank');
};

const Index = (props: AdditionfuncProps) => {
  const { isMobile } = props;

  const { connected, toggleConnection } = useWs();

  const [userMode] = useState(localStorage.getItem('im-mode') ?? '');

  return (
    <div className="im-additionfunc">
      <div className="im-additionfunc-list">
        {self === top && !isMobile && (
          <div
            className="im-additionfunc-list-item"
            onClick={() => handleGoQA()}
          >
            <Icon type="icon-question-fill" />
          </div>
        )}
        {userMode === 'dev' && (
          <div
            className="im-additionfunc-list-item"
            onClick={() => toggleConnection()}
          >
            {connected ? (<Icon type="icon-eye-fill1" />) : (<Icon type="icon-eye-close-fill" />)}
          </div>
        )}
        {self === top && !isMobile && (
          <div
            className="im-additionfunc-list-item"
            onClick={() => openPip()}
          >
            <Icon type="icon-picture-in-picture-2-fill" />
          </div>
        )}
      </div>
    </div >
  );
};

export default Index;
