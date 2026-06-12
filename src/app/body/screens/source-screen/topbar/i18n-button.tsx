import { HStack, Menu, Portal, VStack } from "@chakra-ui/react";
import { SettingsIcon } from "lucide-react";
import IconButton from "~/ui/icon-button";
import LanguageSelect from "./language-select";
import SystemSelect from "./system-select";

export default function I18nButton() {
  return (
    <>
      <HStack display={{ base: "none", md: "flex" }} mx={2.5}>
        <LanguageSelect />
        <SystemSelect />
      </HStack>

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            Icon={SettingsIcon}
            aria-label="Settings"
            display={{ base: "inline-flex", md: "none" }}
            size="sm"
            variant="ghost"
          />
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content p={3}>
              <VStack align="stretch">
                <LanguageSelect w="full" />
                <SystemSelect w="full" />
              </VStack>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
}
