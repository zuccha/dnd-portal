import {
  Checkbox as ChakraCheckbox,
  type CheckboxRootProps as ChakraCheckboxRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Checkbox Indeterminate
//------------------------------------------------------------------------------

export type CheckboxIndeterminateProps = Omit<
  ChakraCheckboxRootProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
  defaultValue?: boolean | "indeterminate";
  label?: string;
  onValueChange?: (checked: boolean | "indeterminate") => void;
  value: boolean | "indeterminate";
};

export default function CheckboxIndeterminate({
  defaultValue,
  label,
  onValueChange,
  value,
  ...rest
}: CheckboxIndeterminateProps) {
  return (
    <ChakraCheckbox.Root
      checked={value}
      cursor="pointer"
      defaultChecked={defaultValue}
      onCheckedChange={(e) => onValueChange?.(e.checked)}
      size="sm"
      {...rest}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control _disabled={{ cursor: "disabled" }} cursor="pointer" />
      {label && <ChakraCheckbox.Label>{label}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  );
}
