import { Group, Text } from 'react-konva';

import { getIconCDN, mouseClickEvent, mouseHoverEvent } from '@/pages/InteractiveMap/utils';

import Image from '../Image';

interface BtrStopProps {
  btrStops: InteractiveMap.BtrStop[];
  show: string[];
}

const Index = (props: BtrStopProps & InteractiveMap.UtilProps) => {
  const {
    btrStops = [],
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
        {btrStops.map((btrStop) => {
          const btrStopHeight = btrStop.position.y;
          let active = true;
          if (activeLayer) {
            if (
              btrStopHeight < heightRange[0] ||
              btrStopHeight > heightRange[1]
            ) {
              active = false;
            }
          }
          if (show.includes('btrStop')) {
            return (
              <Group
                id={`im-btrStop-group-${btrStop.position.x}-${btrStop.position.z}`}
                {...mouseHoverEvent}
                {...mouseClickEvent({
                  text: btrStop.parkingPointName,
                  mapScale,
                  position: {
                    x: btrStop.position.x,
                    y: btrStop.position.z,
                  },
                  real2imagePos,
                })}
                opacity={active ? 1 : 0.1}
                listening={active}
              >
                <Image
                  id={`im-btrStop-image-${btrStop.position.x}-${btrStop.position.z}`}
                  x={real2imagePos.x(btrStop.position.x) - 10 / mapScale}
                  y={real2imagePos.y(btrStop.position.z) - 18 / mapScale}
                  width={20 / mapScale}
                  height={20 / mapScale}
                  imageSrc={getIconCDN('btr_stop')}
                />
                <Text
                  id={`im-btrStop-text-${btrStop.position.x}-${btrStop.position.z}`}
                  x={real2imagePos.x(btrStop.position.x)}
                  y={real2imagePos.y(btrStop.position.z)}
                  fontFamily="JinBuTi"
                  text={btrStop.parkingPointName}
                  fontSize={12 / mapScale}
                  fill={'#efe342'}
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
