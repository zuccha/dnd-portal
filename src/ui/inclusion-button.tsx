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
  const includeKey = String(include) as IncludeKey;

  const toggleState = useCallback(
    () => onValueChange?.(nextIncludes[includeKey]),
    [onValueChange, includeKey]
  );

  return (
    <ChakraButton
      {...rest}
      colorPalette={colorPalettes[includeKey]}
      onClick={toggleState}
      variant={variants[includeKey]}
    />
  );
}

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

type IncludeKey = "false" | "true" | "undefined";

const colorPalettes = {
  false: "red",
  true: "green",
  undefined: "gray",
} as const;

const nextIncludes = {
  false: undefined,
  true: false,
  undefined: true,
} as const;

const variants = {
  false: "solid",
  true: "solid",
  undefined: "outline",
} as const;
