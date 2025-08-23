import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";

export type ButtonProps = ChakraButtonProps;

export default function Button(props: ButtonProps) {
  return <ChakraButton {...props} />;
}
