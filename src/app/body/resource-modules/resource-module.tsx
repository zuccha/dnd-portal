import { HStack, VStack } from "@chakra-ui/react";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { ResourceKind } from "~/models/types/resource-kind";
import type { PaletteName } from "~/utils/palette";
import { createResourceDetailInteractive } from "./resource-detail-interactive";
import ResourceDetailNotFound from "./resource-detail-not-found";
import { type ResourceCreatorExtra, createResourceDialogCreator } from "./resource-dialog-creator";
import {
  type ResourceDialogUpdaterExtra,
  createResourceDialogUpdater,
} from "./resource-dialog-updater";
import { type ResourcesAlbumExtra, createResourcesAlbum } from "./resources-album";
import { createResourcesContext } from "./resources-context";
import { type ResourcesFiltersExtra } from "./resources-filters";
import { createResourcesSidebar } from "./resources-sidebar";
import { type ResourcesTableExtra, createResourcesTable } from "./resources-table";
import type { ResourceAction } from "./resource-action";
import type { ResourceDetailAction } from "./resource-detail";
import type { ComponentType, FC } from "react";

//------------------------------------------------------------------------------
// Resource Module
//------------------------------------------------------------------------------

export type ResourceModule = {
  Detail: ComponentType<{ resourceId: string }>;
  Panel: FC<{ sourceId: string }>;
  kind: ResourceKind;
  path: string;
};

//------------------------------------------------------------------------------
// Create Resource Module
//------------------------------------------------------------------------------

export function createResourceModule<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F>,
  contextOptions: {
    initialPaletteName: PaletteName;
    initialView?: "cards" | "table";
    path: string;
  },
  {
    album,
    detail,
    Extra,
    filters,
    form,
    table,
  }: {
    album: ResourcesAlbumExtra<R, L>;
    detail: {
      Detail: ComponentType<{ actions?: ResourceDetailAction[]; resource: L | undefined }>;
      actions?: ResourceAction<R>[];
    };
    Extra?: ComponentType<{ sourceId: string }>;
    filters: ResourcesFiltersExtra;
    form: ResourceCreatorExtra<R, FF> & ResourceDialogUpdaterExtra<R, FF>;
    table: ResourcesTableExtra<R, L>;
  },
) {
  const { path, ...resourcesContextOptions } = contextOptions;
  const context = createResourcesContext<R>(store.id, resourcesContextOptions);

  const ResourceCreator = createResourceDialogCreator(store, context, form, {
    PreviewCard: album.AlbumCard,
  });
  const ResourceUpdater = createResourceDialogUpdater(store, context, form, {
    PreviewCard: album.AlbumCard,
  });
  const ResourcesAlbum = createResourcesAlbum(store, context, album);
  const ResourcesTable = createResourcesTable(store, context, table);
  const ResourcesSidebar = createResourcesSidebar(store, context, filters);
  const ResourceDetailInteractive = createResourceDetailInteractive(store, context, detail, path);

  const { useView } = context;
  const { useLocalizedResource, useResource } = store;

  //------------------------------------------------------------------------------
  // Resources Panel
  //------------------------------------------------------------------------------

  function ResourcesPanel({ sourceId }: { sourceId: string }) {
    const view = useView();

    return (
      <VStack flex={1} gap={0} h="full" minH={0} overflow="hidden" position="relative" w="full">
        <HStack flex={1} gap={0} minH={0} overflow="hidden" position="relative" w="full">
          {view === "table" && <ResourcesTable sourceId={sourceId} />}
          {view === "cards" && <ResourcesAlbum sourceId={sourceId} />}

          <ResourcesSidebar sourceId={sourceId} />

          <ResourceCreator sourceId={sourceId} />
          <ResourceUpdater sourceId={sourceId} />
          {Extra && <Extra sourceId={sourceId} />}
        </HStack>
      </VStack>
    );
  }

  //------------------------------------------------------------------------------
  // Resource Detail
  //------------------------------------------------------------------------------

  function ResourceDetail({ resourceId }: { resourceId: string }) {
    const resource = useResource(resourceId);
    const localizedResource = useLocalizedResource(resourceId);
    if (!resource || !localizedResource)
      return <ResourceDetailNotFound kind={store.kind} to={path} />;

    return (
      <>
        <ResourceDetailInteractive localizedResource={localizedResource} resource={resource} />
        <ResourceUpdater sourceId={resource.source_id} />
        {Extra && <Extra sourceId={resource.source_id} />}
      </>
    );
  }

  return {
    Detail: ResourceDetail,
    Panel: ResourcesPanel,
    kind: store.kind,
    path,
  } satisfies ResourceModule;
}
