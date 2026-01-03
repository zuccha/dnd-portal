import { Avatar, HStack, Heading, Menu, Portal } from "@chakra-ui/react";
import { useMemo } from "react";
import { type AuthUser, signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nSystems, useI18nSystem } from "~/i18n/i18n-system";
import { useLanguages } from "~/models/language";
import ThemeButton from "~/theme/theme-button";
import Select from "~/ui/select";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// Header
//------------------------------------------------------------------------------

export default function Header() {
  const auth = useAuth();

  return (
    <HStack
      borderBottomWidth={auth.user ? 1 : undefined}
      h={headerHeight}
      justify="space-between"
      px={4}
      py={2}
      w="full"
    >
      <Heading size="lg">D&D Portal</Heading>

      <HStack>
        {auth.user && <UserButton user={auth.user} />}
        <LanguageSelect />
        <SystemSelect />
        <ThemeButton />
      </HStack>
    </HStack>
  );
}

export const headerHeight = "3.5rem";

//------------------------------------------------------------------------------
// Language Select
//------------------------------------------------------------------------------

function LanguageSelect() {
  const [language, setLanguage] = useI18nLang();

  const languages = useLanguages();
  const languageOptions = useMemo(
    () =>
      languages.data?.map(({ code }) => ({
        label: code.toUpperCase(),
        value: code,
      })) ?? [{ label: "EN", value: "en" }],
    [languages.data],
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
// System Select
//------------------------------------------------------------------------------

function SystemSelect() {
  const { t } = useI18nLangContext(i18nContext);
  const [system, setSystem] = useI18nSystem();

  const systemOptions = useMemo(
    () =>
      i18nSystems
        .map((system) => ({
          label: t(`system.${system}`),
          value: system,
        }))
        .sort(compareObjects("label")),
    [t],
  );

  return (
    <Select
      onValueChange={setSystem}
      options={systemOptions}
      size="sm"
      value={system}
      w="6.5em"
    />
  );
}

//------------------------------------------------------------------------------
// User Button
//------------------------------------------------------------------------------

function UserButton({ user }: { user: AuthUser }) {
  const { t } = useI18nLangContext(i18nContext);

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
                {t("button.signout")}
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

  "system.imperial": {
    en: "Imperial",
    it: "Imperiale",
  },
  "system.metric": {
    en: "Metric",
    it: "Metrico",
  },
};
