import {
  Switch as ChakraSwitch,
  type SwitchRootProps as ChakraSwitchRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Switch
//------------------------------------------------------------------------------

export type SwitchRootProps = Omit<
  ChakraSwitchRootProps,
  "checked" | "value"
> & {
  label?: string;
  onValueChange?: (checked: boolean) => void;
  value?: boolean;
};

export default function Switch({
  label,
  onValueChange,
  value,
  ...rest
}: SwitchRootProps) {
  return (
    <ChakraSwitch.Root
      checked={value}
      onCheckedChange={(e) => onValueChange?.(e.checked)}
      {...rest}
    >
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control />
      {label && <ChakraSwitch.Label>{label}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  );
}
