import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';

import classNames from 'classnames';
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

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <div
      className={classNames('im-switch', { on: checked })}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <span className="im-switch-thumb" />
    </div>
  );
};

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

      <div className="im-quicktools-modal-setting-username">
        <div className="im-quicktools-modal-setting-username-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="im-quicktools-modal-setting-username-main">
          <div className="im-quicktools-modal-setting-username-label">
            {t('setting.username')}
          </div>
          <input
            className="im-quicktools-modal-setting-username-input"
            value={username}
            onChange={handleUsernameChange}
            placeholder={t('setting.usernamePlaceholder')}
          />
          <div className="im-quicktools-modal-setting-username-desc">
            {t('setting.usernameContent')}
          </div>
        </div>
      </div>

      <div className="im-quicktools-modal-setting-grid">
        {self === top && (
          <div className={classNames('im-setting-card', { active: !!directoryHandler })}>
            <div className="im-setting-card-head">
              <span className="im-setting-card-title">{t('setting.markerTitle')}</span>
              <button
                className={classNames('im-icon-btn', { active: !!directoryHandler })}
                onClick={handleClickEftWatcherPath}
                title={directoryHandler ? directoryHandler.name : t('setting.enableMarker')}
              >
                {directoryHandler ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                )}
              </button>
            </div>
            <div className="im-setting-card-content">{t('setting.markerContent')}</div>
            <div className="im-setting-card-tips">{t('eftwatcher.tips4')}</div>
          </div>
        )}
        {self === top && (
          <div className={classNames('im-setting-card', { active: !!tarkovGamePathHandler })}>
            <div className="im-setting-card-head">
              <span className="im-setting-card-title">{t('setting.gamePathTitle')}</span>
              <button
                className={classNames('im-icon-btn', { active: !!tarkovGamePathHandler })}
                onClick={handleClickTarkovGamePathPath}
                title={tarkovGamePathHandler ? tarkovGamePathHandler.name : t('setting.enableTarkovGamePath')}
              >
                {tarkovGamePathHandler ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                )}
              </button>
            </div>
            <div className="im-setting-card-content">{t('setting.gamePathContent')}</div>
            <div className="im-setting-card-tips">{t('eftwatcher.tips5')}</div>
          </div>
        )}
        {self === top && (
          <div className={classNames('im-setting-card', { active: autoDelete })}>
            <div className="im-setting-card-head">
              <span className="im-setting-card-title">{t('setting.autoDelete')}</span>
              <Switch checked={autoDelete} onChange={onAutoDeleteChange} />
            </div>
            <div className="im-setting-card-content">{t('setting.autoDeleteContent')}</div>
          </div>
        )}
        <div className={classNames('im-setting-card', { active: locationScale })}>
          <div className="im-setting-card-head">
            <span className="im-setting-card-title">{t('setting.markerScale')}</span>
            <Switch checked={locationScale} onChange={onLocationScaleChange} />
          </div>
          <div className="im-setting-card-content">{t('setting.markerScaleContent')}</div>
        </div>
      </div>

      {self === top && (
        <button className="im-reset-btn" onClick={handleDeleteHandler} title={t('setting.resetPath')}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" /></svg>
          <span>{t('setting.resetPath')}</span>
        </button>
      )}

      <div className="im-warning" onMouseDown={(e) => e.stopPropagation()}>
        <div className="im-warning-shortkeys">
          <span style={{ width: '50%' }}>
            <code>W</code> {t('warning.move_w')}
          </span>
          <span style={{ width: '50%' }}>
            <code>A</code> {t('warning.move_a')}
          </span>
          <span style={{ width: '50%' }}>
            <code>S</code> {t('warning.move_s')}
          </span>
          <span style={{ width: '50%' }}>
            <code>D</code> {t('warning.move_d')}
          </span>
          <span style={{ width: '50%' }}>
            <code>Ctrl+G</code> {t('warning.ctrl_g')}
          </span>
          <span style={{ width: '50%' }}>
            <code>Ctrl+A</code> {t('warning.ctrl_a')}
          </span>
          <span style={{ width: '50%' }}>
            <code>Ctrl+S</code> {t('warning.ctrl_s')}
          </span>
          <span style={{ width: '50%' }}>
            <code>Ctrl+D</code> {t('warning.ctrl_d')}
          </span>
          <span style={{ width: '50%' }}>
            <code>Ctrl+F</code> {t('warning.ctrl_f')}
          </span>
        </div>
        <div className="im-warning-contacts">
          <span>{t('contact.group')}</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
