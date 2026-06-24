import { useEffect, useMemo, useState } from 'react';

import { useInterval } from 'ahooks';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';
import { wsInstance } from '@/utils/socket';

import './style.less';

interface MapInfoProps {
  mapData: InteractiveMap.Data;
  raidInfo?: InteractiveMap.RaidLogProps;
  directoryHandler?: FileSystemDirectoryHandle;
  tarkovGamePathHandler?: FileSystemDirectoryHandle;
  show: boolean;
}

const Index = (props: MapInfoProps) => {
  const { mapData, raidInfo, directoryHandler, tarkovGamePathHandler, show } = props;

  const [realTime, setRealTime] = useState(0);
  const [timeDiff, setTimeDiff] = useState(0);
  const [bossCache, setBossCache] = useState<{ maps: any[]; updatedAt: number }>(
    { maps: [], updatedAt: 0 },
  );

  const [lang] = useRecoilState(langState);

  const { t } = useI18N(lang);

  const tarkovTime = useMemo(() => {
    return (((realTime + timeDiff) * 7) % (24 * 3600000)) - 5 * 3600000;
  }, [realTime]);

  // 当前地图对应的 Boss 列表 (切换地图自动过滤)
  const bosses = useMemo(() => {
    if (!mapData?.normalizedName) return [];
    const matched = bossCache.maps.find(
      (m: any) => m.normalizedName === mapData.normalizedName,
    );
    return matched?.bosses || [];
  }, [bossCache, mapData?.normalizedName]);

  useEffect(() => {
    const machineTime = dayjs().valueOf();
    setRealTime(machineTime);
    setTimeDiff(0);
  }, []);

  useInterval(() => {
    const machineTime = dayjs().valueOf();
    setRealTime(machineTime);
  }, 1000 / 15);

  // 订阅 WebSocket 的 Boss 刷新数据 (缓存全量，切换地图时自动过滤)
  useEffect(() => {
    const handler = (data: any) => {
      if (data?.category !== 'boss') return;
      const { value } = data;
      if (!value?.maps) return;
      setBossCache({ maps: value.maps, updatedAt: value.updatedAt || Date.now() });
    };

    wsInstance.onMessage(handler);
    return () => wsInstance.offMessage(handler);
  }, []);

  return (
    <div
      className={classNames('im-mapinfo', {
        active: show,
      })}
    >
      <div className="im-mapinfo-title">
        <span>{t('mapInfo.title')}</span>
      </div>
      <div className="im-mapinfo-item">
        <span className="im-mapinfo-item-title">{t('mapInfo.gameTime')}</span>
        <span className="tarkov-time">{dayjs(tarkovTime).format('HH:mm:ss')}</span>
        <span className="tarkov-time">{dayjs(tarkovTime).add(12, 'hours').format('HH:mm:ss')}</span>
      </div>
      {mapData.players && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title">{t('mapInfo.pmcs')}</span>
          <span>{mapData.players}</span>
        </div>
      )}
      {mapData.raidDuration && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title">{t('mapInfo.raidTime')}</span>
          <span>
            {mapData.raidDuration} {t('common.minute')}
          </span>
        </div>
      )}
      {bosses.length > 0 && (
        <div className="im-mapinfo-item im-mapinfo-boss">
          <span className="im-mapinfo-item-title">{t('mapInfo.boss')}</span>
          <div className="boss-list">
            {bosses.map((b) => (
              <div className="boss-item" key={b.displayName}>
                <span className="boss-name">{b.displayName}</span>
                <span className="boss-chance">{Math.round(b.spawnChance * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {self === top && window.showDirectoryPicker && !directoryHandler && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title warning">尚未监听截图目录，无法自动获取坐标</span>
        </div>
      )}
      {self === top && window.showDirectoryPicker && !tarkovGamePathHandler && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title warning">尚未监听游戏目录，无法获取战局信息</span>
        </div>
      )}
      {raidInfo?.ip && raidInfo?.port && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title">服务器IP</span>
          <span>
            {raidInfo.ip}:{raidInfo.port}
          </span>
        </div>
      )}
      {raidInfo?.gameMode && raidInfo?.raidMode && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title">游戏模式</span>
          <span>
            {raidInfo.gameMode} ({raidInfo.raidMode})
          </span>
        </div>
      )}
      {raidInfo?.shortId && (
        <div className="im-mapinfo-item">
          <span className="im-mapinfo-item-title">战局ID</span>
          <span>{raidInfo.shortId}</span>
        </div>
      )}
    </div>
  );
};

export default Index;
