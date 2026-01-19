import { Avatar, HStack, Span, VStack } from "@chakra-ui/react";
import { PanelRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { signOut } from "~/auth/auth";
import useAuth from "~/auth/use-auth";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nSystems, useI18nSystem } from "~/i18n/i18n-system";
import { useSelectedCampaignId } from "~/models/campaign";
import { useLangs } from "~/models/lang";
import { Route } from "~/navigation/routes";
import ThemeButton from "~/theme/theme-button";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import Select from "~/ui/select";
import { compareObjects } from "~/utils/object";
import SidebarCampaign from "./sidebar-campaign";
import SidebarCampaignSelector from "./sidebar-campaign-selector";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [campaignId] = useSelectedCampaignId();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed)
    return (
      <VStack borderRightWidth={1} h="full" px={2} py={4}>
        <IconButton
          Icon={PanelRightIcon}
          onClick={() => setCollapsed(false)}
          size="xs"
          variant="ghost"
        />
      </VStack>
    );

  return (
    <VStack borderRightWidth={1} gap={6} h="full" py={4} w="15em">
      <VStack gap={2} px={6} w="full">
        <HStack justify="space-between" w="full">
          <Span fontSize="lg">D&D Portal</Span>
          <HStack gap={0} mr={-2}>
            <ThemeButton />
            <IconButton
              Icon={PanelRightIcon}
              onClick={() => setCollapsed(true)}
              size="xs"
              variant="ghost"
            />
          </HStack>
        </HStack>

        <HStack w="full">
          <LanguageSelect />
          <SystemSelect />
        </HStack>

        <SidebarCampaignSelector />
      </VStack>

      {campaignId && <SidebarCampaign campaignId={campaignId} />}

      <VStack flex={1} justify="flex-end" px={6} w="full">
        <UserButton />
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Language Select
//------------------------------------------------------------------------------

function LanguageSelect() {
  const [language, setLanguage] = useI18nLang();

  const languages = useLangs();
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
      flex={1}
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

function UserButton() {
  const user = useAuth().user;
  const { t } = useI18nLangContext(i18nContext);

  if (!user)
    return (
      <HStack w="full">
        <Link onClick={() => history.pushState({}, "", Route.SignIn)}>
          {t("button.signin")}
        </Link>
        /
        <Link onClick={() => history.pushState({}, "", Route.SignUp)}>
          {t("button.signup")}
        </Link>
      </HStack>
    );

  return (
    <HStack justify="flex-start" overflow="hidden" w="full">
      <Avatar.Root
        borderColor="border.inverted"
        borderWidth={2}
        cursor="pointer"
        size="xs"
      >
        <Avatar.Fallback name={user.name} />
        <Avatar.Image src={user.avatarUrl} />
      </Avatar.Root>

      <Link onClick={signOut} size="sm">
        {t("button.signout")}
      </Link>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "button.signin": {
    en: "Sign in",
    it: "Login",
  },
  "button.signout": {
    en: "Sign out",
    it: "Logout",
  },
  "button.signup": {
    en: "Register",
    it: "Registrati",
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
