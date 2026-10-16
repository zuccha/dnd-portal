import { Box } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Sortable List Drop Indicator Props
//------------------------------------------------------------------------------

export type SortableListDropIndicatorProps = {
  gap: number;
  position: "bottom" | "top";
};

//------------------------------------------------------------------------------
// Sortable List Drop Indicator
//------------------------------------------------------------------------------

export default function SortableListDropIndicator({
  gap,
  position,
}: SortableListDropIndicatorProps) {
  return (
    <Box
      bg="blue.500"
      bottom={position === "bottom" ? -gap / 2 : undefined}
      h={0.5}
      insetInline={0}
      pointerEvents="none"
      position="absolute"
      top={position === "top" ? -gap / 2 : undefined}
      transform={
        position === "bottom" ? "translateY(calc(50% + 1px))" : "translateY(calc(-50% - 1px))"
      }
      zIndex={1}
    />
  );
}
