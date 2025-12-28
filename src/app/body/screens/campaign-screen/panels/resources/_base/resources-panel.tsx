import { Box, Flex, HStack, Separator, VStack } from "@chakra-ui/react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import {
  type ResourceCreatorExtra,
  createResourceCreator,
} from "./resource-creator";
import {
  type ResourceUpdaterExtra,
  createResourceUpdater,
} from "./resource-updater";
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
  {
    album,
    filters,
    form,
    table,
  }: {
    album: ResourcesAlbumExtra<R, L>;
    filters: ResourcesFiltersExtra;
    form: ResourceCreatorExtra<R, DBR, DBT, FF> &
      ResourceUpdaterExtra<R, DBR, DBT, FF>;
    table: ResourcesTableExtra<R, L>;
  },
) {
  const context = createResourcesContext<R>(store.id);

  const ResourceCreator = createResourceCreator(store, context, form);
  const ResourceEditor = createResourceUpdater(store, context, form);
  const ResourcesActions = createResourcesActions(store, context);
  const ResourcesAlbum = createResourcesAlbum(store, context, album);
  const ResourcesCounter = createResourcesCounter(store, context);
  const ResourceFilters = createResourcesFilters(store, context, filters);
  const ResourcesGenericFilters = createResourcesGenericFilters(store, context);
  const ResourcesTable = createResourcesTable(store, context, table);
  const ResourcesViewSwitch = createResourcesViewSwitch(store, context);

  return function ResourcesPanel({ campaignId }: { campaignId: string }) {
    const view = context.useView();

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
          <HStack justify="space-between" w="full">
            <HStack>
              <ResourcesActions campaignId={campaignId} />
              <ResourcesGenericFilters campaignId={campaignId} />
              <Separator h="1.5em" orientation="vertical" />
              <ResourcesCounter campaignId={campaignId} />
            </HStack>
            <ResourcesViewSwitch campaignId={campaignId} />
          </HStack>
          <ResourceFilters w="full" wrap="wrap" />
        </VStack>

        <Flex flex={1} overflow="auto" w="full">
          <Box bgColor="bg.subtle" w="full">
            {view === "table" && <ResourcesTable campaignId={campaignId} />}
            {view === "cards" && <ResourcesAlbum campaignId={campaignId} />}
          </Box>
        </Flex>

        <ResourceCreator campaignId={campaignId} />
        <ResourceEditor campaignId={campaignId} />
      </VStack>
    );
  };
}
