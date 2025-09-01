import {
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Link
//------------------------------------------------------------------------------

export type LinkProps = ChakraLinkProps;

export default function Link(props: LinkProps) {
  return <ChakraLink _hover={{ textDecoration: "underline" }} {...props} />;
}
