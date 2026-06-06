import { HStack, VStack } from "@chakra-ui/react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { PaletteName } from "~/utils/palette";
import {
  type ResourceCreatorExtra,
  createResourceDialogCreator,
} from "./resource-dialog-creator";
import {
  type ResourceDialogUpdaterExtra,
  createResourceDialogUpdater,
} from "./resource-dialog-updater";
import { createResourcesActions } from "./resources-actions";
import {
  type ResourcesAlbumExtra,
  createResourcesAlbum,
} from "./resources-album";
import { createResourcesContext } from "./resources-context";
import { createResourcesCounter } from "./resources-counter";
import {
  type ResourcesFiltersExtra,
  createResourcesFilters,
} from "./resources-filters";
import { createResourcesGenericFilters } from "./resources-generic-filters";
import { createResourcesPrintMode } from "./resources-print-mode";
import ResourcesSidebar from "./resources-sidebar";
import ResourcesSidebarToggleButton from "./resources-sidebar-toggle-button";
import {
  type ResourcesTableExtra,
  createResourcesTable,
} from "./resources-table";
import { createResourcesViewSettings } from "./resources-view-settings";
import { createResourcesViewSwitch } from "./resources-view-switch";

export function createResourcesPanel<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  contextOptions: {
    initialPaletteName: PaletteName;
  },
  {
    album,
    filters,
    form,
    table,
  }: {
    album: ResourcesAlbumExtra<R, L>;
    filters: ResourcesFiltersExtra;
    form: ResourceCreatorExtra<R, DBR, DBT, FF> &
      ResourceDialogUpdaterExtra<R, DBR, DBT, FF>;
    table: ResourcesTableExtra<R, L>;
  },
) {
  const context = createResourcesContext<R>(store.id, contextOptions);

  const ResourceCreator = createResourceDialogCreator(store, context, form);
  const ResourceUpdater = createResourceDialogUpdater(store, context, form);
  const ResourcesActions = createResourcesActions(store, context);
  const ResourcesAlbum = createResourcesAlbum(store, context, album);
  const ResourcesCounter = createResourcesCounter(store, context);
  const ResourceFilters = createResourcesFilters(store, context, filters);
  const ResourcesGenericFilters = createResourcesGenericFilters(store, context);
  const ResourcesTable = createResourcesTable(store, context, table);
  const ResourcesViewSwitch = createResourcesViewSwitch(store, context);
  const ResourcesViewSettings = createResourcesViewSettings(store, context);

  const ResourcesPrintMode = createResourcesPrintMode(store, context, album);

  return function ResourcesPanel({ sourceId }: { sourceId: string }) {
    const view = context.useView();
    const printMode = context.usePrintMode();

    if (printMode)
      return <ResourcesPrintMode h="full" sourceId={sourceId} w="full" />;

    return (
      <HStack flex={1} gap={0} h="full" overflow="auto" w="full">
        {view === "table" && <ResourcesTable sourceId={sourceId} />}
        {view === "cards" && <ResourcesAlbum sourceId={sourceId} />}

        <ResourcesSidebar>
          <HStack justify="space-between" w="full">
            <HStack gap={0} ml={-2}>
              <ResourcesSidebarToggleButton />
            </HStack>
            <ResourcesViewSwitch sourceId={sourceId} />
          </HStack>

          <ResourcesActions sourceId={sourceId} />

          <ResourcesViewSettings sourceId={sourceId} />

          <VStack align="flex-start" gap={3} w="full">
            <ResourcesGenericFilters sourceId={sourceId} />
            <ResourceFilters gap={3} sourceId={sourceId} w="full" />
          </VStack>

          <ResourcesCounter sourceId={sourceId} />
        </ResourcesSidebar>

        <ResourceCreator sourceId={sourceId} />
        <ResourceUpdater sourceId={sourceId} />
      </HStack>
    );
  };
}
