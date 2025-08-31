import {
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Icon Button
//------------------------------------------------------------------------------

export type IconButtonProps = Omit<ChakraIconButtonProps, "children"> & {
  Icon: LucideIcon;
};

export default function IconButton({ Icon, ...rest }: IconButtonProps) {
  return (
    <ChakraIconButton rounded="full" {...rest}>
      <Icon />
    </ChakraIconButton>
  );
}
