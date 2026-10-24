import { Box, Grid, HStack, Image, type StackProps } from "@chakra-ui/react";
import { MenuIcon, SlidersHorizontalIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { Route } from "~/navigation/routes";
import ThemeButton from "~/theme/theme-button";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import ZorboDnDWordmark from "~/ui/zorbo-dnd-wordmark";
import logoUrl from "../../../../../../assets/logo/logo.png";
import { useRightPanelSetCollapsed } from "../right-panel-state";
import { useSidebarSetCollapsed } from "../sidebar/sidebar-state";
import ResourceSearch from "./resource-search";
import TopbarActionsMenu from "./topbar-actions-menu";
import UserButton from "./user-button";

//------------------------------------------------------------------------------
// Topbar
//------------------------------------------------------------------------------

export type TopbarProps = StackProps;

export default function Topbar() {
  const { t } = useI18nLangContext(i18nContext);

  const route = useLocation().pathname;
  const navigate = useNavigate();
  const setSidebarCollapsed = useSidebarSetCollapsed();
  const setRightPanelCollapsed = useRightPanelSetCollapsed();
  const routeSegments = route.split("/").filter(Boolean);
  const hasResourcesSidebar =
    route === Route.Resources ||
    (route.startsWith(`${Route.Resources}/`) && routeSegments.length === 2) ||
    route === Route.PrintDeck;

  return (
    <Grid
      alignItems="center"
      borderBottomWidth={1}
      gridTemplateColumns={{
        base: "minmax(6rem, 1fr) minmax(0, 2fr) minmax(6rem, 1fr)",
        md: "minmax(0, 1fr) minmax(0, 32rem) minmax(0, 1fr)",
      }}
      h={Topbar.height}
      px={{ base: 3, md: 6 }}
      w="full"
      zIndex="docked"
    >
      <HStack>
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
          alignItems="center"
          aria-label={t("home")}
          cursor="pointer"
          display="flex"
          gap={2}
          onClick={() => navigate(Route._)}
          unstyled
        >
          <Image alt="" h={8} src={logoUrl} w={8} />
          <ZorboDnDWordmark
            display={{ base: "none", md: "inline" }}
            fontSize={{ base: "2xl", md: "3xl" }}
          />
        </Button>
      </HStack>

      <ResourceSearch />

      <HStack gap={{ base: 1, md: 2 }} justifySelf="end">
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

        <Box display={{ base: "none", md: "block" }}>
          <ThemeButton />
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <UserButton />
        </Box>
        <Box display={{ base: "block", md: "none" }}>
          <TopbarActionsMenu />
        </Box>
      </HStack>
    </Grid>
  );
}

Topbar.height = "3em";

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  home: {
    en: "Home",
    it: "Home",
  },
  menu: {
    en: "Menu",
    it: "Menu",
  },
  sidebar: {
    en: "Sidebar",
    it: "Sidebar",
  },
};
