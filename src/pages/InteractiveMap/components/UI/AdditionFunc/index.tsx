import { toast } from 'react-toastify';

import Icon from '@/components/Icon';

import './style.less';

interface AdditionfuncProps {
  isMobile: boolean;
}

const openPip = async () => {
  try {
    const video = document.querySelector('.im-additionfunc-video') as HTMLVideoElement;
    await video.requestPictureInPicture();
    toast.info('已开启画中画，支持最小化浏览器后台监听，请勿关闭黑色画中画窗口！');
  } catch (e) {
    toast.info('开启画中画失败，请稍后重试');
  }
};

const Index = (props: AdditionfuncProps) => {
  const { isMobile } = props;
  return (
    <div className="im-additionfunc">
      <div className="im-additionfunc-list">
        <div
          style={{ display: isMobile ? 'none' : 'block' }}
          className="im-additionfunc-list-item"
          onClick={() => openPip()}
        >
          <Icon type="icon-bilibili-fill" />
        </div>
      </div>
      <video className="im-additionfunc-video" src="videos/PIP.mp4" autoPlay muted loop />
    </div >
  );
};

export default Index;
