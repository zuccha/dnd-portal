import {
  Avatar,
  HStack,
  Heading,
  Menu,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useI18n } from "./i18n/i18n";
import { i18nLangStore } from "./i18n/i18n-lang";
import { type AuthUser, signOut } from "./supabase/auth";
import { useLanguages } from "./supabase/language";
import useAuth from "./supabase/use-auth";
import ThemeButton from "./theme/theme-button";
import Select from "./ui/select";

//------------------------------------------------------------------------------
// App Header
//------------------------------------------------------------------------------

export default function AppHeader() {
  const auth = useAuth();

  return (
    <HStack
      justify="space-between"
      px={4}
      py={2}
      shadow={auth.user ? "sm" : undefined}
      w="full"
    >
      <Heading size="lg">D&D</Heading>

      <HStack>
        {auth.user && <UserButton user={auth.user} />}
        <LanguageSelect />
        <ThemeButton />
      </HStack>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Language Select
//------------------------------------------------------------------------------

function LanguageSelect() {
  const [language, setLanguage] = i18nLangStore.use();

  const languages = useLanguages();
  const languageOptions = useMemo(
    () =>
      createListCollection({
        items: languages.data?.map(({ code }) => ({
          label: code.toUpperCase(),
          value: code,
        })) ?? [{ label: "EN", value: "en" }],
      }),
    [languages.data]
  );

  return (
    <Select
      onValueChange={setLanguage}
      options={languageOptions}
      size="sm"
      value={language}
      w="4em"
    />
  );
}

//------------------------------------------------------------------------------
// User Button
//------------------------------------------------------------------------------

function UserButton({ user }: { user: AuthUser }) {
  const i18n = useI18n(i18nContext);

  return (
    <Menu.Root>
      <Menu.Trigger focusRing="outside" mr={2} rounded="full">
        <Avatar.Root
          borderColor="border.inverted"
          borderWidth={2}
          cursor="pointer"
          size="xs"
        >
          <Avatar.Fallback name={user.name} />
          <Avatar.Image src={user.avatarUrl} />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{user.name ?? "User"}</Menu.ItemGroupLabel>
              <Menu.Item onClick={signOut} value="logout">
                {i18n.t("button.signout")}
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "button.signout": {
    en: "Sign out",
    it: "Logout",
  },
};
