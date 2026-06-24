import { useState } from 'react';

import classNames from 'classnames';
import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';

import Icon from '@/components/Icon';

import './style.less';

interface MapSelectProps {
  mapList: InteractiveMap.Data[];
  activeMap: InteractiveMap.Data;
  activeLayer: string | undefined;
  onMapChange: (mapId: string) => void;
  onLayerChange: (layer: string) => void;
}

const Index = (props: MapSelectProps) => {
  const { mapList, activeMap, activeLayer, onMapChange, onLayerChange } = props;

  const [active, setActive] = useState(false);

  const [lang] = useRecoilState(langState);

  const { t } = useI18N(lang);

  const handleToggle = () => setActive(!active);

  const handleMapChange = (mapId: string) => {
    onMapChange?.(mapId);
    setActive(false);
  };

  const handleLayerChange = (name: string) => {
    onLayerChange?.(name);
    setActive(false);
  };

  // 是否有多图层 (layers 数组存在且非空)
  const hasLayers = !!(activeMap.layers && activeMap.layers.length > 0);

  return (
    <div className="im-mapselect">
      <div className="im-mapselect-surface" onClick={handleToggle}>
        <span className="im-mapselect-surface-map">
          {activeMap.name || t('others.selectMap')}
        </span>
        <span className="im-mapselect-surface-layer">
          {activeLayer || t('others.surface')}
        </span>
        <span className="im-mapselect-surface-arrow">
          {active ? (
            <Icon type="icon-arrow-drop-down-fill" />
          ) : (
            <Icon type="icon-arrow-drop-up-fill" />
          )}
        </span>
      </div>
      <div className={classNames('im-mapselect-dropdown', { active })}>
        <div className="im-mapselect-dropdown-col im-mapselect-dropdown-maps">
          {mapList
            .filter((map) => map.id)
            .map((map) => {
              const mapHasLayers = !!(map.layers && map.layers.length > 0);
              return (
                <div
                  key={map.id}
                  className={classNames('im-mapselect-dropdown-item', {
                    active: map.name === activeMap.name,
                  })}
                  onClick={() => handleMapChange(map.id)}
                >
                  <span>{map.name}</span>
                  {mapHasLayers && <span className="im-mapselect-dropdown-item-arrow">›</span>}
                </div>
              );
            })}
        </div>
        <div className="im-mapselect-dropdown-col im-mapselect-dropdown-layers">
          <div
            className={classNames('im-mapselect-dropdown-item', {
              active: !activeLayer,
            })}
            onClick={() => handleLayerChange('')}
          >
            <span>{t('others.surface')}</span>
          </div>
          {hasLayers && activeMap.layers!.map((layer) => (
            <div
              key={layer.name}
              className={classNames('im-mapselect-dropdown-item', {
                active: layer.name === activeLayer,
              })}
              onClick={() => handleLayerChange(layer.name)}
            >
              <span>{layer.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
