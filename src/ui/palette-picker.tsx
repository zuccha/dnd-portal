import { Box, ColorSwatch, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { CheckIcon } from "lucide-react";
import {
  type PaletteName,
  palettes,
  usePaletteNameOptions,
} from "~/utils/palette";
import Icon from "./icon";

//------------------------------------------------------------------------------
// Palette Picker
//------------------------------------------------------------------------------

type PalettePickerProps = {
  onPaletteChange: (paletteName: PaletteName) => void;
  paletteName: PaletteName;
};

export default function PalettePicker({
  onPaletteChange,
  paletteName,
}: PalettePickerProps) {
  const paletteNameOptions = usePaletteNameOptions();

  return (
    <Menu.Root>
      <Menu.Trigger asChild focusRing="outside">
        <ColorSwatch
          cursor="pointer"
          tabIndex={0}
          value={palettes[paletteName][700]}
        />
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              {paletteNameOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onSelect={() => onPaletteChange(option.value)}
                  value={option.value}
                >
                  <HStack gap={2} minW={36}>
                    <Box
                      bgColor={palettes[option.value][700]}
                      borderColor="border.emphasized"
                      borderRadius="full"
                      borderWidth={1}
                      h={4}
                      w={4}
                    />
                    <Text flex={1}>{option.label}</Text>
                    {option.value === paletteName && (
                      <Icon Icon={CheckIcon} color="fg.muted" size="xs" />
                    )}
                  </HStack>
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
