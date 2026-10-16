import { Span } from "@chakra-ui/react";
import { GripVerticalIcon } from "lucide-react";
import type { DragEventHandler, KeyboardEventHandler } from "react";

//------------------------------------------------------------------------------
// Sortable List Handle Props
//------------------------------------------------------------------------------

export type SortableListHandleProps = {
  draggable: true;
  label: string;
  onDragEnd: () => void;
  onDragStart: DragEventHandler<HTMLSpanElement>;
  onKeyDown: KeyboardEventHandler<HTMLSpanElement>;
};

//------------------------------------------------------------------------------
// Sortable List Handle
//------------------------------------------------------------------------------

export default function SortableListHandle({
  draggable,
  label,
  onDragEnd,
  onDragStart,
  onKeyDown,
}: SortableListHandleProps) {
  return (
    <Span
      aria-label={label}
      color="fg.muted"
      cursor="grab"
      draggable={draggable}
      flexShrink={0}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      title={label}
    >
      <GripVerticalIcon aria-hidden="true" size={16} />
    </Span>
  );
}
