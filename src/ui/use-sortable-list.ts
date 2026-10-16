import { useState } from "react";
import type { SortableListHandleProps } from "./sortable-list-handle";
import type { DragEventHandler } from "react";

//------------------------------------------------------------------------------
// Sortable List Item Props
//------------------------------------------------------------------------------

export type SortableListItemProps = {
  dragHandleProps: Omit<SortableListHandleProps, "label">;
  itemProps: {
    onDragOver: DragEventHandler<HTMLDivElement>;
    onDrop: DragEventHandler<HTMLDivElement>;
    opacity: number;
  };
  dropPosition: "bottom" | "top" | undefined;
};

//------------------------------------------------------------------------------
// Sortable List Item
//------------------------------------------------------------------------------

type SortableListItem = {
  id: string;
};

//------------------------------------------------------------------------------
// Use Sortable List
//------------------------------------------------------------------------------

export function useSortableList<T extends SortableListItem>(
  items: readonly T[],
  onMove: (itemId: string, toIndex: number) => void,
) {
  const [draggedItemId, setDraggedItemId] = useState<string>();
  const [dropTargetItemId, setDropTargetItemId] = useState<string>();

  return (itemId: string, index: number): SortableListItemProps => {
    const draggedIndex = items.findIndex(({ id }) => id === draggedItemId);

    return {
      dragHandleProps: {
        draggable: true,
        onDragEnd: () => {
          setDraggedItemId(undefined);
          setDropTargetItemId(undefined);
        },
        onDragStart: (event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", itemId);
          setDraggedItemId(itemId);
          setDropTargetItemId(undefined);
        },
        onKeyDown: (event) => {
          if (event.key === "ArrowUp" && index > 0) {
            event.preventDefault();
            onMove(itemId, index - 1);
          }
          if (event.key === "ArrowDown" && index < items.length - 1) {
            event.preventDefault();
            onMove(itemId, index + 1);
          }
        },
      },
      dropPosition:
        dropTargetItemId === itemId && draggedItemId !== itemId && draggedIndex >= 0
          ? draggedIndex < index
            ? "bottom"
            : "top"
          : undefined,
      itemProps: {
        onDragOver: (event) => {
          event.preventDefault();
          setDropTargetItemId(itemId);
        },
        onDrop: (event) => {
          event.preventDefault();
          if (draggedItemId && draggedItemId !== itemId) onMove(draggedItemId, index);
          setDraggedItemId(undefined);
          setDropTargetItemId(undefined);
        },
        opacity: draggedItemId === itemId ? 0.45 : 1,
      },
    };
  };
}
