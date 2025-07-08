import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';

import { clearSavedHandle } from '../../../utils';

import './style.less';

export interface SettingProps {
  directoryHandler?: FileSystemDirectoryHandle;
  tarkovGamePathHandler?: FileSystemDirectoryHandle;
  locationScale: boolean;
  autoDelete: boolean;
  onClickEftWatcherPath: () => void;
  onClickTarkovGamePathPath: () => void;
  onLocationScaleChange: (b: boolean) => void;
  onAutoDeleteChange: (b: boolean) => void;
}

const Index = (props: SettingProps) => {
  const {
    locationScale,
    autoDelete,
    directoryHandler,
    tarkovGamePathHandler,
    onLocationScaleChange,
    onAutoDeleteChange,
    onClickEftWatcherPath,
    onClickTarkovGamePathPath,
  } = props;

  const [lang] = useRecoilState(langState);

  const [username, setUsername] = useState(localStorage.getItem('im-username') ?? '默认用户');

  const { t } = useI18N(lang);

  const handleClickEftWatcherPath = () => {
    onClickEftWatcherPath();
  };

  const handleClickTarkovGamePathPath = () => {
    onClickTarkovGamePathPath();
  };

  const handleDeleteHandler = async () => {
    try {
      await clearSavedHandle('eftWatcherDir');
      await clearSavedHandle('tarkovGameDir');
      toast.info('重置目录成功，稍后刷新页面', { autoClose: 1500 });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      toast.info('重置目录失败，请刷新重试', { autoClose: 2000 });
    }
  };

  const handleToggleLocationScale = () => {
    onLocationScaleChange(!locationScale);
  };

  const handleToggleAutoDelete = () => {
    onAutoDeleteChange(!autoDelete);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUsername(newName);
    newName && localStorage.setItem('im-username', newName);
  };

  return (
    <div className="im-quicktools-modal-setting" onMouseDown={(e) => e.stopPropagation()}>
      <div className="im-quicktools-modal-setting-title">
        <span>{t('setting.title')}</span>
      </div>
      <div className="im-quicktools-modal-setting-block">
        {self === top && (
          <button
            className="im-quicktools-modal-setting-button"
            style={{ color: !directoryHandler ? '#ffffff' : '#288828' }}
            onClick={handleClickEftWatcherPath}
          >
            {directoryHandler
              ? `${t('setting.realtimeMarker')} ${directoryHandler?.name}`
              : t('setting.enableMarker')}
          </button>
        )}
        {self === top && (
          <button
            className="im-quicktools-modal-setting-button"
            style={{ color: !tarkovGamePathHandler ? '#ffffff' : '#288828' }}
            onClick={handleClickTarkovGamePathPath}
          >
            {tarkovGamePathHandler
              ? `${t('setting.tarkovGamePath')} ${tarkovGamePathHandler?.name}`
              : t('setting.enableTarkovGamePath')}
          </button>
        )}
        {self === top && (
          <button
            className="im-quicktools-modal-setting-button"
            style={{ color: '#e59400' }}
            onClick={handleDeleteHandler}
          >
            {t('setting.resetPath')}
          </button>
        )}
        {self === top && (
          <div className="im-quicktools-modal-setting-divider" />
        )}
        {self === top && (
          <button
            style={{ color: !autoDelete ? '#882828' : '#288828' }}
            className="im-quicktools-modal-setting-button"
            onClick={handleToggleAutoDelete}
          >
            {t('setting.autoDelete')} ({autoDelete ? t('common.enable') : t('common.disable')})
          </button>
        )}
        <button
          style={{ color: !locationScale ? '#882828' : '#288828' }}
          className="im-quicktools-modal-setting-button"
          onClick={handleToggleLocationScale}
        >
          {t('setting.markerScale')} ({locationScale ? t('common.enable') : t('common.disable')})
        </button>
        <div className="im-quicktools-modal-setting-divider" />
        <div className="im-quicktools-modal-setting-input">
          <div className="im-quicktools-modal-setting-input-label">{t('setting.username')}</div>
          <input
            value={username}
            onChange={handleUsernameChange}
            placeholder={t('setting.usernamePlaceholder')}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
