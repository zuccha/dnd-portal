import {
  Checkbox as ChakraCheckbox,
  type CheckboxRootProps as ChakraCheckboxRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Checkbox
//------------------------------------------------------------------------------

export type CheckboxProps = Omit<
  ChakraCheckboxRootProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
  defaultValue?: boolean;
  label?: string;
  onValueChange?: (checked: boolean) => void;
  value?: boolean;
};

export default function Checkbox({
  defaultValue,
  label,
  onValueChange,
  value,
  ...rest
}: CheckboxProps) {
  return (
    <ChakraCheckbox.Root
      _disabled={{ cursor: "disabled" }}
      checked={value}
      cursor="pointer"
      defaultChecked={defaultValue}
      onCheckedChange={(e) => onValueChange?.(!!e.checked)}
      size="sm"
      {...rest}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control _disabled={{ cursor: "disabled" }} cursor="pointer" />
      {label && <ChakraCheckbox.Label fontWeight="normal">{label}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  );
}
