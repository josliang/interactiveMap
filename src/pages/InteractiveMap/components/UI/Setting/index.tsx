import { ChangeEvent, useState } from 'react';

import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';

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

  const { t } = useI18N(lang);

  const handleClickEftWatcherPath = () => {
    onClickEftWatcherPath();
  };

  const handleClickTarkovGamePathPath = () => {
    onClickTarkovGamePathPath();
  };

  const handleToggleLocationScale = () => {
    onLocationScaleChange(!locationScale);
  };

  const handleToggleAutoDelete = () => {
    onAutoDeleteChange(!autoDelete);
  };

  const [value, setValue] = useState(localStorage.getItem('im-username') ?? 'default');

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    newValue && localStorage.setItem('im-username', newValue);
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
        <button
          style={{ color: !autoDelete ? '#882828' : '#288828' }}
          className="im-quicktools-modal-setting-button"
          onClick={handleToggleAutoDelete}
        >
          {t('setting.autoDelete')} ({autoDelete ? t('common.enable') : t('common.disable')})
        </button>
        <button
          style={{ color: !locationScale ? '#882828' : '#288828' }}
          className="im-quicktools-modal-setting-button"
          onClick={handleToggleLocationScale}
        >
          {t('setting.markerScale')} ({locationScale ? t('common.enable') : t('common.disable')})
        </button>
        <div className="im-quicktools-modal-setting-input">
          <input
            value={value}
            onChange={handleValueChange}
            placeholder="请输入用户名"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
