import {
  Switch as ChakraSwitch,
  type SwitchRootProps as ChakraSwitchRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Switch
//------------------------------------------------------------------------------

export type SwitchRootProps = Omit<ChakraSwitchRootProps, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean) => void;
};

export default function Switch({ onCheckedChange, ...rest }: SwitchRootProps) {
  return (
    <ChakraSwitch.Root
      onCheckedChange={(e) => onCheckedChange?.(e.checked)}
      {...rest}
    >
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control />
    </ChakraSwitch.Root>
  );
}
