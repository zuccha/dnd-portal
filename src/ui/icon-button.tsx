import {
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
  createIcon,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import Tooltip, { type TooltipProps } from "./tooltip";

//------------------------------------------------------------------------------
// Icon Button
//------------------------------------------------------------------------------

export type IconButtonProps = Omit<ChakraIconButtonProps, "children"> & {
  Icon: LucideIcon | ReturnType<typeof createIcon>;
  label: string;
  tooltipPositioning?: TooltipProps["positioning"];
};

export default function IconButton({
  Icon,
  label,
  tooltipPositioning,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip
      content={label}
      openDelay={600}
      positioning={tooltipPositioning}
      showArrow
    >
      <ChakraIconButton rounded="full" {...rest}>
        <Icon />
      </ChakraIconButton>
    </Tooltip>
  );
}
