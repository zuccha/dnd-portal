import { Image } from "react-konva";
import useImage from "use-image";
import CanvasItemBox from "./canvas-item-box";
import useInterpolatedText from "./hooks/use-interpolated-text";
import type { Data } from "./models/data";
import type { LayoutItemImage } from "./models/layout";

//------------------------------------------------------------------------------
// Canvas Item Image
//------------------------------------------------------------------------------

export type CanvasItemImageProps = {
  data: Data;
  item: LayoutItemImage;
};

export default function CanvasItemImage({ data, item }: CanvasItemImageProps) {
  const source = useInterpolatedText(item.source, data);
  const [image] = useImage(source);

  return (
    <CanvasItemBox item={item}>
      {(w, h) => <Image height={h} image={image} width={w} />}
    </CanvasItemBox>
  );
}
