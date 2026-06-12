import { HStack, Span, type StackProps } from "@chakra-ui/react";
import ThemeButton from "~/theme/theme-button";
import I18nButton from "./i18n-button";
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
      px={{ base: 3, md: 6 }}
      w="full"
    >
      <HStack
        flex={1}
        fontFamily="Title Wave"
        fontSize={{ base: "md", md: "2xl" }}
        fontWeight="bold"
      >
        <Span color="fg.error">D&D</Span> Portal
      </HStack>

      <HStack gap={{ base: 1, md: 2 }}>
        <I18nButton />
        <ThemeButton />
        <UserButton />
      </HStack>
    </HStack>
  );
}

Topbar.height = "3em";
