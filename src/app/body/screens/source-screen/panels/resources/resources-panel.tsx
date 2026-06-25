import { HStack } from "@chakra-ui/react";
import type { ComponentType } from "react";
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
import {
  type ResourcesAlbumExtra,
  createResourcesAlbum,
} from "./resources-album";
import { createResourcesContext } from "./resources-context";
import { type ResourcesFiltersExtra } from "./resources-filters";
import { createResourcesPrintMode } from "./resources-print-mode";
import { createResourcesSidebar } from "./resources-sidebar";
import {
  type ResourcesTableExtra,
  createResourcesTable,
} from "./resources-table";

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
    Extra,
    filters,
    form,
    table,
  }: {
    album: ResourcesAlbumExtra<R, L>;
    Extra?: ComponentType<{ sourceId: string }>;
    filters: ResourcesFiltersExtra;
    form: ResourceCreatorExtra<R, DBR, DBT, FF> &
      ResourceDialogUpdaterExtra<R, DBR, DBT, FF>;
    table: ResourcesTableExtra<R, L>;
  },
) {
  const context = createResourcesContext<R>(store.id, contextOptions);

  const ResourceCreator = createResourceDialogCreator(store, context, form);
  const ResourceUpdater = createResourceDialogUpdater(store, context, form);
  const ResourcesAlbum = createResourcesAlbum(store, context, album);
  const ResourcesTable = createResourcesTable(store, context, table);
  const ResourcesSidebar = createResourcesSidebar(store, context, filters);

  const ResourcesPrintMode = createResourcesPrintMode(store, context, album);

  return function ResourcesPanel({ sourceId }: { sourceId: string }) {
    const view = context.useView();
    const printMode = context.usePrintMode();

    if (printMode)
      return <ResourcesPrintMode flex={1} h="full" sourceId={sourceId} />;

    return (
      <HStack
        flex={1}
        gap={0}
        h="full"
        overflow="auto"
        position="relative"
        w="full"
      >
        {view === "table" && <ResourcesTable sourceId={sourceId} />}
        {view === "cards" && <ResourcesAlbum sourceId={sourceId} />}

        <ResourcesSidebar sourceId={sourceId} />

        <ResourceCreator sourceId={sourceId} />
        <ResourceUpdater sourceId={sourceId} />
        {Extra && <Extra sourceId={sourceId} />}
      </HStack>
    );
  };
}
