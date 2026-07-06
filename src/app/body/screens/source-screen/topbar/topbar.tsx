import { HStack, Span, type StackProps } from "@chakra-ui/react";
import { MenuIcon, SlidersHorizontalIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import ThemeButton from "~/theme/theme-button";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import { useRightPanelSetCollapsed } from "../right-panel-state";
import { useSidebarSetCollapsed } from "../sidebar/sidebar-state";
import PrintDeckButton from "./print-deck-button";
import UserButton from "./user-button";

//------------------------------------------------------------------------------
// Topbar
//------------------------------------------------------------------------------

export type TopbarProps = StackProps;

export default function Topbar() {
  const { t } = useI18nLangContext(i18nContext);

  const route = useRoute();
  const setSidebarCollapsed = useSidebarSetCollapsed();
  const setRightPanelCollapsed = useRightPanelSetCollapsed();
  const hasResourcesSidebar =
    route.startsWith(Route.Resources) || route === Route.PrintDeck;

  return (
    <HStack
      borderBottomWidth={1}
      h={Topbar.height}
      justify="space-between"
      px={{ base: 3, md: 6 }}
      w="full"
      zIndex="docked"
    >
      <HStack
        flex={1}
        fontFamily="Title Wave"
        fontSize={{ base: "md", md: "2xl" }}
        fontWeight="bold"
      >
        <IconButton
          Icon={MenuIcon}
          display={{ base: "inline-flex", md: "none" }}
          flexShrink={0}
          label={t("menu")}
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          size="sm"
          variant="ghost"
        />
        <Button
          cursor="pointer"
          onClick={() => history.pushState({}, "", Route._)}
          unstyled
        >
          <Span color="fg.error">D&D</Span> Portal
        </Button>
      </HStack>

      <HStack gap={{ base: 1, md: 2 }}>
        {hasResourcesSidebar && (
          <IconButton
            Icon={SlidersHorizontalIcon}
            display={{ base: "inline-flex", md: "none" }}
            label={t("sidebar")}
            onClick={() => setRightPanelCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
          />
        )}

        <PrintDeckButton />
        <ThemeButton />
        <UserButton />
      </HStack>
    </HStack>
  );
}

Topbar.height = "3em";

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  menu: {
    en: "Menu",
    it: "Menu",
  },
  open_print_deck: {
    en: "Open print deck",
    it: "Apri pagina di stampa",
  },
  sidebar: {
    en: "Sidebar",
    it: "Sidebar",
  },
};
