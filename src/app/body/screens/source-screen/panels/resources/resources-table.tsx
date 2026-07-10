import { Box, Flex, Table } from "@chakra-ui/react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useCanEditSourceResources } from "~/models/sources";
import type { ResourcesContext } from "./resources-context";
import ResourcesEmpty from "./resources-empty";
import ResourcesLoading from "./resources-loading";
import ResourcesRefreshing from "./resources-refreshing";
import {
  type ResourcesTableHeadExtra,
  createResourcesTableHead,
} from "./resources-table-head";
import {
  type ResourcesTableRowExtra,
  createResourcesTableRow,
} from "./resources-table-row";

//------------------------------------------------------------------------------
// Resources Table Extra
//------------------------------------------------------------------------------

export type ResourcesTableExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = ResourcesTableHeadExtra<R, L> & ResourcesTableRowExtra<R, L>;

//------------------------------------------------------------------------------
// Create Resources Table
//------------------------------------------------------------------------------

type ResourcesTableProps = {
  sourceId: string;
};

export function createResourcesTable<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesTableExtra<R, L>,
) {
  const ResourcesTableHead = createResourcesTableHead(store, context, extra);
  const ResourcesTableRow = createResourcesTableRow(store, context, extra);

  const {
    useFilteredResourceIds,
    useFilteredResourceIdsLoading,
    useLocalizeResource,
  } = store;

  return function ResourcesTable({ sourceId }: ResourcesTableProps) {
    const filteredResourceIds = useFilteredResourceIds(sourceId);
    const loading = useFilteredResourceIdsLoading(sourceId);
    const localizeResource = useLocalizeResource(sourceId);
    const editable = useCanEditSourceResources(sourceId);

    if (!filteredResourceIds.length)
      return loading ?
          <ResourcesLoading name={store.displayName} />
        : <ResourcesEmpty />;

    return (
      <Box flex={1} h="full" position="relative">
        {loading && (
          <Box
            pointerEvents="none"
            position="absolute"
            right={4}
            top={2}
            zIndex={1}
          >
            <ResourcesRefreshing />
          </Box>
        )}

        <Flex bgColor="bg.subtle" h="full" overflow="scroll">
          <Box bgColor="bg.subtle" w="full">
            <Table.Root
              borderCollapse="separate"
              borderSpacing={0}
              showColumnBorder
              stickyHeader
              variant="line"
            >
              <Table.Header>
                <ResourcesTableHead sourceId={sourceId} />
              </Table.Header>

              <Table.Body>
                {filteredResourceIds.map((id) => (
                  <ResourcesTableRow
                    editable={editable}
                    key={id}
                    localizeResource={localizeResource}
                    resourceId={id}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Flex>
      </Box>
    );
  };
}
