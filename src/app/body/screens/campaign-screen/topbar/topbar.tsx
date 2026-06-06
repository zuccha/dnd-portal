import { HStack, Span, type StackProps } from "@chakra-ui/react";
import ThemeButton from "~/theme/theme-button";
import LanguageSelect from "./language-select";
import SystemSelect from "./system-select";
import UserButton from "./user-button";

//------------------------------------------------------------------------------
// Topbar
//------------------------------------------------------------------------------

export type TopbarProps = StackProps;

export default function Topbar() {
  return (
    <HStack
      borderBottomWidth={1}
      h={Topbar.height}
      justify="space-between"
      px={6}
      w="full"
    >
      <Span fontSize="lg">D&D Portal</Span>

      <HStack gap={4}>
        <HStack mr={2}>
          <LanguageSelect />
          <SystemSelect />
        </HStack>
        <UserButton />
        <ThemeButton />
      </HStack>
    </HStack>
  );
}

Topbar.height = "3em";
