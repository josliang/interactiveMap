import { Group, Text } from 'react-konva';

import { getIconCDN, mouseClickEvent, mouseHoverEvent } from '@/pages/InteractiveMap/utils';

import Image from '../Image';

interface BtrProps {
  btrs: InteractiveMap.Btr[];
  show: string[];
}

const Index = (props: BtrProps & InteractiveMap.UtilProps) => {
  const {
    btrs = [],
    baseMapStatus,
    mapScale,
    activeLayer,
    heightRange,
    real2imagePos,
    show,
  } = props;
  if (baseMapStatus === 'loaded' && show.length > 0) {
    return (
      <Group>
        {btrs.map((btr) => {
          const btrHeight = btr.position.y;
          let active = true;
          if (activeLayer) {
            if (
              btrHeight < heightRange[0] ||
              btrHeight > heightRange[1]
            ) {
              active = false;
            }
          }
          if (show.includes('btr')) {
            return (
              <Group
                id={`im-btr-group-${btr.position.x}-${btr.position.z}`}
                {...mouseHoverEvent}
                {...mouseClickEvent({
                  text: btr.parkingPointName,
                  mapScale,
                  position: {
                    x: btr.position.x,
                    y: btr.position.z,
                  },
                  real2imagePos,
                })}
                opacity={active ? 1 : 0.1}
                listening={active}
              >
                <Image
                  id={`im-btr-image-${btr.position.x}-${btr.position.z}`}
                  x={real2imagePos.x(btr.position.x) - 12 / mapScale}
                  y={real2imagePos.y(btr.position.z) - 20 / mapScale}
                  width={24 / mapScale}
                  height={24 / mapScale}
                  imageSrc={getIconCDN('btr')}
                />
                <Text
                  id={`im-btr-text-${btr.position.x}-${btr.position.z}`}
                  x={real2imagePos.x(btr.position.x)}
                  y={real2imagePos.y(btr.position.z)}
                  fontFamily="JinBuTi"
                  text={btr.parkingPointName}
                  fontSize={12 / mapScale}
                  fill={'#f0e442'}
                  width={600 / mapScale}
                  offsetX={300 / mapScale}
                  align="center"
                  shadowColor="#000000"
                  shadowBlur={12 / mapScale}
                  offsetY={-6 / mapScale}
                  listening={false}
                />
              </Group>
            );
          } else {
            return null;
          }
        })}
      </Group>
    );
  } else {
    return null;
  }
};

export default Index;
