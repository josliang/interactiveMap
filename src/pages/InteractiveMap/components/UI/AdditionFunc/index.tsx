import Icon from '@/components/Icon';

import './style.less';

interface AdditionfuncProps {
  isMobile: boolean;
}


const openPip = async () => {
  const video = document.querySelector('.im-additionfunc-video') as HTMLVideoElement;
  await video.requestPictureInPicture();
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
      <video className="im-additionfunc-video" src="/videos/PIP.mp4" autoPlay muted loop />
    </div >
  );
};

export default Index;
