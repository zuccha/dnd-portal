import {
  ColorPicker as ChakraColorPicker,
  HStack,
  Portal,
  parseColor,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Color Picker
//------------------------------------------------------------------------------

export type ColorPickerProps = {
  onValueChange: (value: string) => void;
  value: string;
};

export default function ColorPicker({
  onValueChange,
  value,
}: ColorPickerProps) {
  return (
    <ChakraColorPicker.Root
      defaultValue={parseColor(value)}
      maxW="200px"
      onValueChangeEnd={(details) => onValueChange(details.valueAsString)}
      size="xs"
    >
      <ChakraColorPicker.HiddenInput />
      <ChakraColorPicker.Control>
        <ChakraColorPicker.Trigger />
      </ChakraColorPicker.Control>
      <Portal>
        <ChakraColorPicker.Positioner>
          <ChakraColorPicker.Content>
            <ChakraColorPicker.Area />
            <HStack>
              <ChakraColorPicker.EyeDropper size="xs" variant="outline" />
              <ChakraColorPicker.Sliders />
            </HStack>
            <ChakraColorPicker.ChannelInput channel="hex" />
          </ChakraColorPicker.Content>
        </ChakraColorPicker.Positioner>
      </Portal>
    </ChakraColorPicker.Root>
  );
}
