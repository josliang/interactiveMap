import Image from '../Image';

interface LayerMapProps {
  id: string;
  baseMap: HTMLImageElement | undefined;
  imageSrc: string | undefined;
  coordinateRotation?: number;
}

const Index = (props: LayerMapProps) => {
  const { id, baseMap, imageSrc, coordinateRotation = 180 } = props;

  if (baseMap && imageSrc) {
    if (coordinateRotation === 0) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation}
          offset={{ x: 0, y: -18 }}
          scaleX={1}
          scaleY={0.81}
        />
      );
    } else if (coordinateRotation === 90) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: baseMap.width, y: 0 }}
          scaleX={Math.abs(baseMap.height / baseMap.width)}
          scaleY={Math.abs(baseMap.width / baseMap.height)}
        />
      );
    } else if (coordinateRotation === 180) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: 0, y: 0 }}
          scaleX={1}
          scaleY={1}
        />
      );
    } else if (coordinateRotation === 270) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: 0, y: baseMap.height }}
          scaleX={Math.abs(baseMap.height / baseMap.width)}
          scaleY={Math.abs(baseMap.width / baseMap.height)}
        />
      );
    }
  }
};

export default Index;
