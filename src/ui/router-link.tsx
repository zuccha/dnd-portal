import { Link as ChakraLink, type LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { Link as ReactRouterLink, type LinkProps as ReactRouterLinkProps } from "react-router";

//------------------------------------------------------------------------------
// Router Link
//------------------------------------------------------------------------------

export type RouterLinkProps = Omit<ChakraLinkProps, "asChild" | "href"> &
  Pick<ReactRouterLinkProps, "to">;

export default function RouterLink({ children, to, ...props }: RouterLinkProps) {
  return (
    <ChakraLink
      asChild
      color="fg.info"
      textDecoration="none"
      textUnderlineOffset="0.15em"
      _hover={{ textDecoration: "underline" }}
      {...props}
    >
      <ReactRouterLink to={to}>{children}</ReactRouterLink>
    </ChakraLink>
  );
}
