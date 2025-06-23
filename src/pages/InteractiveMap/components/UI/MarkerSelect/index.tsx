import classNames from 'classnames';
import { useRecoilState } from 'recoil';

import useI18N from '@/i18n';
import langState from '@/store/lang';

import { getIconCDN } from '@/pages/InteractiveMap/utils';

import './style.less';

export interface MarkerSelectProps {
  extracts: string[];
  btrs: string[];
  onExtractsChange: (extracts: InteractiveMap.Faction[]) => void;
  onBtrsChange: (btrs: string[]) => void;
}

const Index = (props: MarkerSelectProps) => {
  const {
    extracts,
    btrs,
    onExtractsChange,
    onBtrsChange,
  } = props;

  const [lang] = useRecoilState(langState);

  const { t } = useI18N(lang);

  const handleToggleExtract = (_extract: string) => {
    if (extracts.includes(_extract)) {
      onExtractsChange?.(extracts.filter((e) => e !== _extract) as InteractiveMap.Faction[]);
    } else {
      onExtractsChange?.([...extracts, _extract] as InteractiveMap.Faction[]);
    }
  };

  const handleToggleBtr = (_btr: string) => {
    if (btrs.includes(_btr)) {
      onBtrsChange?.(btrs.filter((h) => h !== _btr));
    } else {
      onBtrsChange?.([...btrs, _btr]);
    }
  };

  return (
    <div className="im-quicktools-modal-marker" onMouseDown={(e) => e.stopPropagation()}>
      <div className="im-quicktools-modal-marker-title">
        <span>{t('marker.extracts')}</span>
      </div>
      <div className="im-quicktools-modal-marker-block">
        <div className="im-quicktools-modal-marker-block-list">
          {['pmc', 'scav', 'shared', 'transit'].map((faction) => {
            return (
              <img
                className={classNames({
                  active: extracts.includes(faction),
                })}
                src={getIconCDN(`extract_${faction}`)}
                onClick={() => handleToggleExtract(faction)}
              />
            );
          })}
        </div>
      </div>
      <div className="im-quicktools-modal-marker-title">
        <span>{t('marker.others')}</span>
      </div>
      <div className="im-quicktools-modal-marker-block">
        <div className="im-quicktools-modal-marker-block-list">
          {['btr'].map((btr) => {
            return (
              <img
                className={classNames({
                  active: btrs.includes(btr),
                })}
                src={getIconCDN('btr')}
                onClick={() => handleToggleBtr(btr)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
