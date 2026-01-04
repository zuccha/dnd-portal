import {
  Icon as ChakraIcon,
  type IconProps as ChakraIconProps,
  createIcon,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Icon
//------------------------------------------------------------------------------

export type IconProps = Omit<ChakraIconProps, "children"> & {
  Icon: LucideIcon | ReturnType<typeof createIcon>;
};

export default function Icon({ Icon, ...rest }: IconProps) {
  return (
    <ChakraIcon {...rest}>
      <Icon />
    </ChakraIcon>
  );
}
