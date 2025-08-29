import { Group, Rect } from "react-konva";
import CanvasItem from "./canvas-item";
import type { Data } from "./models/data";
import type { Layout } from "./models/layout";

//------------------------------------------------------------------------------
// Canvas Frame
//------------------------------------------------------------------------------

export type CanvasFrameProps = {
  data: Data;
  layout: Layout;
};

export default function CanvasFrame({ data, layout }: CanvasFrameProps) {
  const bleed = layout.bleed;
  const bleedW = bleed.visible ? bleed.w : 0;
  const bleedH = bleed.visible ? bleed.h : 0;

  const layoutSize = layout.size;

  const frameW = layoutSize.w + 2 * bleedW;
  const frameH = layoutSize.h + 2 * bleedH;

  return (
    <Group height={frameH} width={frameW}>
      {bleed.visible && (
        <Rect fill={bleed.color} height={frameH} width={frameW} />
      )}

      <Group height={layout.size.h} width={layout.size.w} x={bleedW} y={bleedH}>
        {layout.items.ids.map((itemId) => (
          <CanvasItem
            data={data}
            item={layout.items.byId[itemId]}
            key={itemId}
          />
        ))}
      </Group>
    </Group>
  );
}
