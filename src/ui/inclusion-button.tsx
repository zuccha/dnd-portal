import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { useCallback } from "react";

//------------------------------------------------------------------------------
// Inclusion Button
//------------------------------------------------------------------------------

export type InclusionButtonProps = Omit<
  ChakraButtonProps,
  "colorScheme" | "onClick"
> & {
  include: boolean | undefined;
  onValueChange?: (include: boolean | undefined) => void;
};

export default function InclusionButton({
  include,
  onValueChange,
  ...rest
}: InclusionButtonProps) {
  const toggleState = useCallback(
    () => onValueChange?.(nextIncludes[String(include) as IncludeKey]),
    [onValueChange, include]
  );

  return (
    <ChakraButton
      {...rest}
      colorPalette={colorSchemes[String(include) as IncludeKey]}
      onClick={toggleState}
      variant="surface"
    />
  );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

type IncludeKey = "false" | "true" | "undefined";

const colorSchemes = {
  false: "red",
  true: "green",
  undefined: "gray",
} as const;

const nextIncludes = {
  false: undefined,
  true: false,
  undefined: true,
} as const;
