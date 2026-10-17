import { Separator, VStack } from "@chakra-ui/react";
import { SlidersHorizontalIcon, StarIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import IconButton from "~/ui/icon-button";
import Section from "~/ui/section";
import { resourcePanelTranslations } from "../screens/source-screen/panels/panel-translations";
import {
  useRightPanelCollapsed,
  useRightPanelSetCollapsed,
} from "../screens/source-screen/right-panel-state";
import { resourceFavoriteRoutesStore } from "../screens/source-screen/sidebar/resource-navigation-state";
import { createResourcesActions } from "./resources-actions";
import { type ResourcesFiltersExtra, createResourcesFilters } from "./resources-filters";
import { createResourcesViewSettings } from "./resources-view-settings";
import type { ResourcesContext } from "./resources-context";

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
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  extra: ResourcesSidebarExtra,
  path: string,
) {
  const ResourcesActions = createResourcesActions(store, context);
  const ResourcesFilters = createResourcesFilters(store, context, extra);
  const ResourcesViewSettings = createResourcesViewSettings(store, context);

  return function ResourcesSidebar({ sourceId }: ResourcesSidebarProps) {
    const { t } = useI18nLangContext({ ...resourcePanelTranslations, ...i18nContext });
    const collapsed = useRightPanelCollapsed();
    const setCollapsed = useRightPanelSetCollapsed();
    const [favoriteRoutes, setFavoriteRoutes] = resourceFavoriteRoutesStore.use();
    const favorite = favoriteRoutes.includes(path);
    const favoriteLabel = t(favorite ? "remove_favorite" : "add_favorite");

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
          pb={4}
          pt={2}
          separator={<Separator w="full" />}
          w="full"
        >
          <Section
            action={
              <IconButton
                aria-label={favoriteLabel}
                aria-pressed={favorite}
                color={favorite ? "orange.400" : "fg.muted"}
                Icon={StarIcon}
                label={favoriteLabel}
                onClick={() =>
                  setFavoriteRoutes((previous) =>
                    favorite ? previous.filter((route) => route !== path) : [...previous, path],
                  )
                }
                size="xs"
                variant="ghost"
                _icon={{ fill: favorite ? "currentColor" : "none" }}
              />
            }
            titleFontSize="md"
            title={t(path)}
          />
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
  "add_favorite": {
    en: "Add to favorites",
    it: "Aggiungi ai preferiti",
  },
  "remove_favorite": {
    en: "Remove from favorites",
    it: "Rimuovi dai preferiti",
  },
  "sidebar.close": {
    en: "Close sidebar",
    it: "Chiudi sidebar",
  },
  "sidebar.open": {
    en: "Open sidebar",
    it: "Apri sidebar",
  },
};
