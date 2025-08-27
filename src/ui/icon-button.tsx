import {
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

//------------------------------------------------------------------------------
// Icon Button
//------------------------------------------------------------------------------

export type IconButtonProps = Omit<ChakraIconButtonProps, "children"> & {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

export default function IconButton({ Icon, ...rest }: IconButtonProps) {
  return (
    <ChakraIconButton {...rest}>
      <Icon />
    </ChakraIconButton>
  );
}
