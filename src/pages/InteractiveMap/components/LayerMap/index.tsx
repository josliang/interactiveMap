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
    if (coordinateRotation === 90) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: baseMap.width + 5, y: 9 }}
        />
      );
    } else if (coordinateRotation === 180) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: 0, y: 0 }}
        />
      );
    } else if (coordinateRotation === 270) {
      return (
        <Image
          id={id}
          imageSrc={imageSrc}
          rotation={coordinateRotation - 180}
          offset={{ x: 0, y: baseMap.height }}
        />
      );
    }
  }
};

export default Index;
