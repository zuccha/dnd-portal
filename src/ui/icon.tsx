import {
  Icon as ChakraIcon,
  type IconProps as ChakraIconProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Icon
//------------------------------------------------------------------------------

export type IconProps = Omit<ChakraIconProps, "children"> & {
  Icon: LucideIcon;
};

export default function Icon({ Icon, ...rest }: IconProps) {
  return (
    <ChakraIcon {...rest}>
      <Icon />
    </ChakraIcon>
  );
}
