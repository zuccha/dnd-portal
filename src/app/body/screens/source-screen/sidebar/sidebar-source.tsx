import { VStack } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { resourcePanelTranslations } from "../panels/panel-translations";
import { resourcePanels } from "../panels/panels";
import { smallScreenMediaQuery } from "../responsive-sidebar-default";
import SidebarSection from "./sidebar-section";
import { useSidebarSetCollapsed } from "./sidebar-state";

//------------------------------------------------------------------------------
// Sidebar Source
//------------------------------------------------------------------------------

export default function SidebarSource() {
  const { t } = useI18nLangContext(resourcePanelTranslations);
  const route = useLocation().pathname;
  const navigateRoute = useNavigate();
  const setSidebarCollapsed = useSidebarSetCollapsed();

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

  return (
    <VStack align="flex-start" flex={1} gap={0} px={2} w="full">
      <VStack flex={1} gap={0} w="full">
        {localizedResourcePanels.map(({ id, items }) => (
          <SidebarSection id={id} items={items} key={id} title={t(id)} />
        ))}
      </VStack>
    </VStack>
  );
}
