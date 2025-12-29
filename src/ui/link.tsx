import { Button, type ButtonProps } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Link
//------------------------------------------------------------------------------

export type LinkProps = ButtonProps;

export default function Link(props: LinkProps) {
  return (
    <Button
      _hover={{ textDecoration: "underline" }}
      cursor="pointer"
      textAlign="left"
      unstyled
      {...props}
    />
  );
}
