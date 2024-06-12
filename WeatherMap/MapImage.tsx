import { useMap } from './node_modules/react-map-gl/dist/es5/exports-maplibre';

export default function MapImage(props: {
  imageName: string;
  imageID: string;
}) {
  const { current: map } = useMap();

  if (!map) return null;

  if (!map.hasImage(props.imageName)) {
    const image = new Image(1000, 1000);
    image.src = props.imageName;
    image.onload = () => {
      if (!map.hasImage(props.imageID)) map.addImage(props.imageID, image);
    };
  }

  return null;
}
