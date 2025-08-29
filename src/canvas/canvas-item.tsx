import CanvasItemBox from "./canvas-item-box";
import CanvasItemImage from "./canvas-item-image";
import CanvasItemLine from "./canvas-item-line";
import CanvasItemText from "./canvas-item-text";
import type { Data } from "./models/data";
import type { LayoutItem } from "./models/layout";

//------------------------------------------------------------------------------
// Canvas Item
//------------------------------------------------------------------------------

export type CanvasItemProps = {
  data: Data;
  item: LayoutItem;
};

export default function CanvasItem({ data, item }: CanvasItemProps) {
  if (!item.visible) return null;

  const type = item._type;
  if (type === "line") return <CanvasItemLine item={item} />;
  if (type === "image") return <CanvasItemImage data={data} item={item} />;
  if (type === "text") return <CanvasItemText data={data} item={item} />;
  return <CanvasItemBox item={item} />;
}
