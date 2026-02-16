import { HStack, Separator, VStack } from "@chakra-ui/react";
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
import {
  type ResourcesTableExtra,
  createResourcesTable,
} from "./resources-table";
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

  const ResourcesPrintMode = createResourcesPrintMode(store, context, album);

  return function ResourcesPanel({ sourceId }: { sourceId: string }) {
    const view = context.useView();
    const printMode = context.usePrintMode();

    if (printMode)
      return <ResourcesPrintMode h="full" sourceId={sourceId} w="full" />;

    return (
      <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
        <VStack
          align="space-between"
          borderBottomWidth={1}
          gap={2}
          justify="center"
          px={4}
          py={2}
          w="full"
        >
          <HStack align="flex-start" justify="space-between" w="full">
            <HStack wrap="wrap">
              <ResourcesActions sourceId={sourceId} />
              <ResourcesGenericFilters sourceId={sourceId} />
              <Separator h="1.5em" orientation="vertical" />
              <ResourcesCounter sourceId={sourceId} />
            </HStack>
            <ResourcesViewSwitch sourceId={sourceId} />
          </HStack>
          <ResourceFilters sourceId={sourceId} w="full" wrap="wrap" />
        </VStack>

        {view === "table" && <ResourcesTable sourceId={sourceId} />}
        {view === "cards" && <ResourcesAlbum sourceId={sourceId} />}

        <ResourceCreator sourceId={sourceId} />
        <ResourceUpdater sourceId={sourceId} />
      </VStack>
    );
  };
}
