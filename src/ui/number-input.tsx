import {
  NumberInput as ChakraNumberInput,
  type NumberInputRootProps as ChakraNumberInputRootProps,
} from "@chakra-ui/react";
import { useLayoutEffect, useState } from "react";

//------------------------------------------------------------------------------
// Number Input
//------------------------------------------------------------------------------

export type NumberInputProps = Omit<
  ChakraNumberInputRootProps,
  "onChange" | "onValueChange" | "value"
> & {
  onValueChange?: (value: number) => void;
  value: number;
};

export default function NumberInput({
  onValueChange,
  value,
  ...rest
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(`${value}`);

  useLayoutEffect(() => {
    setLocalValue((prev) =>
      (parseFloat(prev) || 0) === value ? prev : `${value}`
    );
  }, [value]);

  return (
    <ChakraNumberInput.Root
      {...rest}
      onValueChange={(e) => {
        setLocalValue(e.value);
        onValueChange?.(e.valueAsNumber || 0);
      }}
      value={localValue}
    >
      <ChakraNumberInput.Control />
      <ChakraNumberInput.Input placeholder="0" />
    </ChakraNumberInput.Root>
  );
}
