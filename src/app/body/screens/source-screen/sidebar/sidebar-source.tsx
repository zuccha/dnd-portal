import { Tabs, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import DotIcon from "~/icons/dot-icon";
import { resourcePanelTranslations } from "../panels/panel-translations";
import { resourcePanels } from "../panels/panels";
import { smallScreenMediaQuery } from "../responsive-sidebar-default";
import {
  resourceFavoriteRoutesStore,
  resourceNavigationTabStore,
} from "./resource-navigation-state";
import SectionButton from "./section-button";
import SidebarSection from "./sidebar-section";
import { useSidebarSetCollapsed } from "./sidebar-state";

//------------------------------------------------------------------------------
// Sidebar Source
//------------------------------------------------------------------------------

export default function SidebarSource() {
  const { lang, t } = useI18nLangContext({ ...resourcePanelTranslations, ...sidebarContext });
  const route = useLocation().pathname;
  const navigateRoute = useNavigate();
  const setSidebarCollapsed = useSidebarSetCollapsed();
  const [tab, setTab] = resourceNavigationTabStore.use();
  const favoriteRoutes = resourceFavoriteRoutesStore.useValue();

  //------------------------------------------------------------------------------
  // Navigate to Resource Panel
  //------------------------------------------------------------------------------

  const navigateToResourcePanel = useCallback(
    (value: string) => {
      navigateRoute(value);
      if (globalThis.matchMedia?.(smallScreenMediaQuery).matches) {
        setSidebarCollapsed(true);
      }
    },
    [navigateRoute, setSidebarCollapsed],
  );

  const localizedResourcePanels = useMemo(
    () =>
      resourcePanels.map(({ id, items }) => ({
        id,
        items: items.map(({ modifier, route: value }) => ({
          label: t(value),
          modifier,
          onClick: () => navigateToResourcePanel(value),
          selected: route === value,
          value,
        })),
      })),
    [navigateToResourcePanel, route, t],
  );

  const favoriteItems = useMemo(
    () =>
      localizedResourcePanels
        .flatMap(({ items }) => items)
        .filter(({ value }) => favoriteRoutes.includes(value))
        .sort((a, b) => a.label.localeCompare(b.label, lang)),
    [favoriteRoutes, lang, localizedResourcePanels],
  );

  return (
    <VStack align="stretch" flex={1} gap={1} px={2} w="full">
      <Tabs.Root
        css={{ "--tabs-height": "var(--chakra-sizes-8)" }}
        mx={-2}
        onValueChange={({ value }) => setTab(value as "all" | "favorites")}
        size="sm"
        value={tab}
        variant="enclosed"
        w="calc(100% + 1rem)"
      >
        <Tabs.List borderRadius={0} padding={1} w="full">
          <Tabs.Trigger borderRadius={0} flex={1} justifyContent="center" value="all">
            {t("all")}
          </Tabs.Trigger>
          <Tabs.Trigger borderRadius={0} flex={1} justifyContent="center" value="favorites">
            {t("favorites")}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="all">
          <VStack align="stretch" flex={1} gap={0} w="full">
            {localizedResourcePanels.map(({ id, items }) => (
              <SidebarSection id={id} items={items} key={id} title={t(id)} />
            ))}
          </VStack>
        </Tabs.Content>
        <Tabs.Content value="favorites">
          <VStack align="stretch" flex={1} gap={0} w="full">
            {favoriteItems.length ? (
              favoriteItems.map((item) => (
                <SectionButton
                  Icon={DotIcon}
                  active={item.selected}
                  key={item.value}
                  label={item.label}
                  onClick={item.onClick}
                />
              ))
            ) : (
              <Text color="fg.muted" fontSize="sm" px={3} py={2} textAlign="center">
                {t("no_favorites")}
              </Text>
            )}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Sidebar Context
//------------------------------------------------------------------------------

const sidebarContext = {
  all: {
    en: "All",
    it: "Tutti",
  },
  favorites: {
    en: "Favorites",
    it: "Preferiti",
  },
  no_favorites: {
    en: "No favorite resources.",
    it: "Non hai risorse preferite.",
  },
};
