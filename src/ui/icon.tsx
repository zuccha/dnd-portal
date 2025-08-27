import {
  Icon as ChakraIcon,
  type IconProps as ChakraIconProps,
} from "@chakra-ui/react";
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

//------------------------------------------------------------------------------
// Icon
//------------------------------------------------------------------------------

export type IconProps = Omit<ChakraIconProps, "children"> & {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

export default function Icon({ Icon, ...rest }: IconProps) {
  return (
    <ChakraIcon {...rest}>
      <Icon />
    </ChakraIcon>
  );
}
