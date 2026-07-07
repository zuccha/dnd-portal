import {
  Box,
  Center,
  ColorSwatch,
  HStack,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
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
  onValueChange: (paletteName: PaletteName) => void;
  value: PaletteName;
};

export default function PalettePicker({
  onValueChange,
  value,
}: PalettePickerProps) {
  const paletteNameOptions = usePaletteNameOptions();

  return (
    <Menu.Root>
      <Menu.Trigger asChild focusRing="outside">
        <Center borderWidth={1} h={9} rounded="sm" tabIndex={0} w={9}>
          <ColorSwatch
            cursor="pointer"
            size="lg"
            value={palettes[value][700]}
          />
        </Center>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              {paletteNameOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onSelect={() => onValueChange(option.value)}
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
                    {option.value === value && (
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
