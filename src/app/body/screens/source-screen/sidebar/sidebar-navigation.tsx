import { Span, VStack } from "@chakra-ui/react";
import { CircleHelpIcon, HouseIcon, InfoIcon, LibraryBigIcon, PrinterIcon } from "lucide-react";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { printDeck } from "~/models/print-deck/print-deck-store";
import { Route } from "~/navigation/routes";
import { smallScreenMediaQuery } from "../responsive-sidebar-default";
import SidebarNavigationButton from "./sidebar-navigation-button";
import { useSidebarSetCollapsed } from "./sidebar-state";

//------------------------------------------------------------------------------
// Sidebar Navigation
//------------------------------------------------------------------------------

export default function SidebarNavigation() {
  const { t } = useI18nLangContext(i18nContext);
  const printDeckEntries = printDeck.useEntries();
  const route = useLocation().pathname;
  const navigateRoute = useNavigate();
  const setSidebarCollapsed = useSidebarSetCollapsed();
  const printDeckCount = printDeckEntries.length;
  const printDeckCountLabel = printDeckCount > 99 ? "99+" : `${printDeckCount}`;

  //------------------------------------------------------------------------------
  // Navigate
  //------------------------------------------------------------------------------

  const navigate = useCallback(
    (value: string) => {
      navigateRoute(value);
      if (globalThis.matchMedia?.(smallScreenMediaQuery).matches) {
        setSidebarCollapsed(true);
      }
    },
    [navigateRoute, setSidebarCollapsed],
  );

  return (
    <VStack gap={0} px={2} w="full">
      <SidebarNavigationButton
        active={route === Route._}
        Icon={HouseIcon}
        label={t("home")}
        onClick={() => navigate(Route._)}
      />
      <SidebarNavigationButton
        active={route === Route.Sources || route.startsWith(`${Route.Sources}/`)}
        Icon={LibraryBigIcon}
        label={t("sources")}
        onClick={() => navigate(Route.Sources)}
      />
      <SidebarNavigationButton
        active={route === Route.PrintDeck}
        Icon={PrinterIcon}
        trailing={
          !!printDeckCount && (
            <Span
              bg="fg.error"
              borderRadius="full"
              color="fg.inverted"
              fontSize="2xs"
              fontWeight="bold"
              lineHeight={1}
              minW={4}
              px={1}
              py={0.5}
              textAlign="center"
            >
              {printDeckCountLabel}
            </Span>
          )
        }
        label={t("print_deck")}
        onClick={() => navigate(Route.PrintDeck)}
      />
      <SidebarNavigationButton
        active={route === Route.About}
        Icon={InfoIcon}
        label={t("about")}
        onClick={() => navigate(Route.About)}
      />
      <SidebarNavigationButton
        active={route === Route.Guide}
        Icon={CircleHelpIcon}
        label={t("info")}
        onClick={() => navigate(Route.Guide)}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  about: {
    en: "About",
    it: "Informazioni",
  },
  home: {
    en: "Home",
    it: "Home",
  },
  info: {
    en: "Guide",
    it: "Guida",
  },
  print_deck: {
    en: "Print Deck",
    it: "Mazzo di stampa",
  },
  sources: {
    en: "Sources",
    it: "Fonti",
  },
};
