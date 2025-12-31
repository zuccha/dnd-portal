import { Table } from "@chakra-ui/react";
import { useCanEditCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { ResourcesContext } from "./resources-context";
import ResourcesEmpty from "./resources-empty";
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
  campaignId: string;
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

  return function ResourcesTable({ campaignId }: ResourcesTableProps) {
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);
    const editable = useCanEditCampaign(campaignId);

    if (!filteredResourceIds.length) return <ResourcesEmpty />;

    return (
      <Table.Root
        borderCollapse="separate"
        borderSpacing={0}
        showColumnBorder
        stickyHeader
        variant="line"
      >
        <Table.Header>
          <ResourcesTableHead campaignId={campaignId} />
        </Table.Header>

        <Table.Body>
          {filteredResourceIds.map((id) => (
            <ResourcesTableRow editable={editable} key={id} resourceId={id} />
          ))}
        </Table.Body>
      </Table.Root>
    );
  };
}
