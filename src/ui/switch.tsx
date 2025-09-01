import {
  Switch as ChakraSwitch,
  type SwitchRootProps as ChakraSwitchRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Switch
//------------------------------------------------------------------------------

export type SwitchRootProps = Omit<ChakraSwitchRootProps, "onCheckedChange"> & {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
};

export default function Switch({
  label,
  onCheckedChange,
  ...rest
}: SwitchRootProps) {
  return (
    <ChakraSwitch.Root
      onCheckedChange={(e) => onCheckedChange?.(e.checked)}
      {...rest}
    >
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control />
      {label && <ChakraSwitch.Label>{label}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  );
}
