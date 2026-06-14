import { Separator, VStack } from "@chakra-ui/react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useRightPanelCollapsed } from "../../right-panel-state";
import { createResourcesActions } from "./resources-actions";
import type { ResourcesContext } from "./resources-context";
import { createResourcesCounter } from "./resources-counter";
import {
  type ResourcesFiltersExtra,
  createResourcesFilters,
} from "./resources-filters";
import { createResourcesGenericFilters } from "./resources-generic-filters";
import ResourcesSidebarToggleButton from "./resources-sidebar-toggle-button";
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
  const ResourcesCounter = createResourcesCounter(store, context);
  const ResourceFilters = createResourcesFilters(store, context, extra);
  const ResourcesGenericFilters = createResourcesGenericFilters(store, context);
  const ResourcesViewSettings = createResourcesViewSettings(store, context);

  return function ResourcesSidebar({ sourceId }: ResourcesSidebarProps) {
    const collapsed = useRightPanelCollapsed();

    return (
      <VStack
        align="flex-start"
        bg="bg"
        borderLeftWidth={1}
        boxShadow={{ base: "lg", md: "none" }}
        display={collapsed ? { base: "none", md: "flex" } : "flex"}
        h="full"
        justify="flex-start"
        position={{ base: "absolute", md: "relative" }}
        right={0}
        top={0}
        w={collapsed ? "2rem" : "15rem"}
        zIndex="modal"
      >
        <ResourcesSidebarToggleButton />

        <VStack
          display={collapsed ? "none" : "flex"}
          overflow="auto"
          py={4}
          separator={<Separator w="full" />}
          w="full"
        >
          <ResourcesViewSettings sourceId={sourceId} />

          <VStack align="flex-start" gap={3} pb={3} px={6} w="full">
            <ResourcesGenericFilters sourceId={sourceId} />
            <ResourceFilters gap={3} sourceId={sourceId} w="full" />
            <ResourcesCounter sourceId={sourceId} />
          </VStack>

          <ResourcesActions sourceId={sourceId} />
        </VStack>
      </VStack>
    );
  };
}
