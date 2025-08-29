import { Line } from "react-konva";
import type { LayoutItemLine } from "./models/layout";

//------------------------------------------------------------------------------
// Canvas Item Line
//------------------------------------------------------------------------------

export type CanvasItemLineProps = {
  item: LayoutItemLine;
};

export default function CanvasItemLine({ item }: CanvasItemLineProps) {
  return (
    <Line
      points={[item.x0, item.y0, item.x1, item.y1]}
      stroke={item.color}
      strokeWidth={item.thickness}
    />
  );
}
