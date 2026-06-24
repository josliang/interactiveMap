import { useEffect, useState } from 'react';

import classNames from 'classnames';
import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';

import './style.less';

interface EFTWatcherProps {
  directoryHandler?: FileSystemDirectoryHandle;
  tarkovGamePathHandler?: FileSystemDirectoryHandle;
  onClickEftWatcherPath: () => void;
  onClickTarkovGamePath: () => void;
}

const Index = (props: EFTWatcherProps) => {
  const { directoryHandler, tarkovGamePathHandler, onClickEftWatcherPath, onClickTarkovGamePath } =
    props;

  const [show, setShow] = useState(false);
  const [username, setUsername] = useState('');

  const [lang] = useRecoilState(langState);

  const { t } = useI18N(lang);

  const handleCloseModal = () => {
    if (!window.showDirectoryPicker) {
      setShow(false);
    }
  };

  const handleClickEftWatcherPath = () => {
    onClickEftWatcherPath();
  };

  const handleClickTarkovGamePath = () => {
    onClickTarkovGamePath();
  };

  const handleGoQA = () => {
    const url = (window as any).location.href.replaceAll('interactive', 'qa');
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (directoryHandler && tarkovGamePathHandler) {
      setShow(false);
    }
  }, [directoryHandler, tarkovGamePathHandler]);

  useEffect(() => {
    if (self === top) {
      setShow(true);
    }
    setUsername(localStorage.getItem('im-username') || '默认用户');
  }, []);

  return (
    <div
      className={classNames('im-eftwatcher-modal', {
        active: show,
      })}
      onMouseDown={handleCloseModal}
    >
      <div className="im-eftwatcher" onMouseDown={(e) => e.stopPropagation()}>

        <div className="im-eftwatcher-title">
          <span>{t('eftwatcher.title')}</span>
        </div>
        {
          /*
          <div className="im-eftwatcher-content">
              <span>{t('eftwatcher.tips1')}</span>
              <span>{t('eftwatcher.tips2')}</span>
              <span>{t('eftwatcher.tips3')}</span>
              <span style={{ color: '#ffff88' }}>{t('eftwatcher.tips4')}</span>
              <span style={{ color: '#ffff88' }}>{t('eftwatcher.tips5')}</span>
          </div>
          */
        }
        <div className="im-eftwatcher-buttons">
          <div className="im-eftwatcher-buttons-row">
            {window.showDirectoryPicker ? (
              <button
                className={classNames('button button-default', { active: !!directoryHandler })}
                onClick={() => handleClickEftWatcherPath()}
              >
                {directoryHandler ? t('eftwatcher.disableScrPath') : t('eftwatcher.enableScrPath')}
              </button>
            ) : (
              <button className="button button-default">{t('eftwatcher.unsupport')}</button>
            )}
            {window.showDirectoryPicker && (
              <button
                className={classNames('button button-default', { active: !!tarkovGamePathHandler })}
                onClick={() => handleClickTarkovGamePath()}
              >
                {tarkovGamePathHandler
                  ? t('eftwatcher.disableGamePath')
                  : t('eftwatcher.enableGamePath')}
              </button>
            )}
          </div>
          <button
            className="button button-default im-eftwatcher-later"
            onClick={() => setShow(false)}
          >
            {t('eftwatcher.later')}
          </button>
        </div>
        {
          username === '默认用户' && (
            <div className="im-eftwatcher-first">
              <div className="im-eftwatcher-first-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" />
                </svg>
              </div>
              <div className="im-eftwatcher-first-main">
                <div className="im-eftwatcher-first-title">{t('eftwatcher.first')}</div>
              </div>
              <button
                className="im-eftwatcher-first-btn"
                onClick={() => handleGoQA()}
              >
                {t('eftwatcher.doc')}
              </button>
            </div>
          )
        }
        {/*
        <div className="im-eftwatcher-contacts">
          <span>{t('contact.group')}</span>
          <span>{t('contact.email')}</span>
        </div>
        */}
      </div>
    </div>
  );
};

export default Index;
