import { Layer, Stage } from "react-konva";
import CanvasFrame from "./canvas-frame";
import type { Data } from "./models/data";
import type { Layout } from "./models/layout";

//------------------------------------------------------------------------------
// Canvas
//------------------------------------------------------------------------------

export type CanvasProps = {
  data: Data;
  layout: Layout;
  scale: number;
};

export default function Canvas({ data, layout, scale }: CanvasProps) {
  return (
    <Stage height={layout.size.h * scale} width={layout.size.w * scale}>
      <Layer scale={{ x: scale, y: scale }}>
        <CanvasFrame data={data} layout={layout} />
      </Layer>
    </Stage>
  );
}
