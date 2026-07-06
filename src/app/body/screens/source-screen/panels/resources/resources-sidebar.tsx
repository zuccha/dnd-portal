import { Separator, VStack } from "@chakra-ui/react";
import { SlidersHorizontalIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import IconButton from "~/ui/icon-button";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../../right-panel-state";
import { createResourcesActions } from "./resources-actions";
import type { ResourcesContext } from "./resources-context";
import {
  type ResourcesFiltersExtra,
  createResourcesFilters,
} from "./resources-filters";
import { createResourcesViewSettings } from "./resources-view-settings";

//------------------------------------------------------------------------------
// Resources Sidebar Extra
//------------------------------------------------------------------------------

export type ResourcesSidebarExtra = ResourcesFiltersExtra;

//------------------------------------------------------------------------------
// Create Resources Sidebar
//------------------------------------------------------------------------------

export type ResourcesSidebarProps = {
  sourceId: string;
};

export function createResourcesSidebar<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesSidebarExtra,
) {
  const ResourcesActions = createResourcesActions(store, context);
  const ResourcesFilters = createResourcesFilters(store, context, extra);
  const ResourcesViewSettings = createResourcesViewSettings(store, context);

  return function ResourcesSidebar({ sourceId }: ResourcesSidebarProps) {
    const { t } = useI18nLangContext(i18nContext);
    const collapsed = useRightPanelCollapsed();
    const setCollapsed = useRightPanelSetCollapsed();

    return (
      <VStack
        align="flex-start"
        bg="bg"
        borderLeftWidth={1}
        display={collapsed ? { base: "none", md: "flex" } : "flex"}
        h="full"
        justify="flex-start"
        position={{ base: "absolute", md: "relative" }}
        right={0}
        top={0}
        w={collapsed ? "2rem" : "15rem"}
        zIndex="docked"
      >
        <IconButton
          Icon={SlidersHorizontalIcon}
          bgColor="bg"
          display={{ base: "none", md: "inline-flex" }}
          label={collapsed ? t("sidebar.open") : t("sidebar.close")}
          left={0}
          onClick={() => setCollapsed((prev) => !prev)}
          position="absolute"
          size="xs"
          tooltipPositioning={{ placement: "left" }}
          top={5}
          transform="translateX(-50%)"
          variant="outline"
          zIndex="docked"
        />

        <VStack
          display={collapsed ? "none" : "flex"}
          overflow="auto"
          py={4}
          separator={<Separator w="full" />}
          w="full"
        >
          <ResourcesViewSettings sourceId={sourceId} />
          <ResourcesFilters sourceId={sourceId} />
          <ResourcesActions sourceId={sourceId} />
        </VStack>
      </VStack>
    );
  };
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "sidebar.close": {
    en: "Close sidebar",
    it: "Chiudi sidebar",
  },
  "sidebar.open": {
    en: "Open sidebar",
    it: "Apri sidebar",
  },
};
