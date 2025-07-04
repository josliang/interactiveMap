import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Icon from '@/components/Icon';

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
    iframe.src = location.href;

    pipDoc.body.appendChild(iframe);
  } catch (e) {
    toast.info('开启画中画失败，请刷新重试', { autoClose: 2000 });
  }
};

const Index = (props: AdditionfuncProps) => {
  const { isMobile } = props;

  const navigate = useNavigate();

  const handleGoQA = () => {
    navigate('/qa');
  };

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
