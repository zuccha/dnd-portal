import { type StackProps } from "@chakra-ui/react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Filters Extra
//------------------------------------------------------------------------------

export type ResourcesFiltersExtra = {
  Filters: React.FC<StackProps>;
};

//------------------------------------------------------------------------------
// Create Resources Filters
//------------------------------------------------------------------------------

export type ResourcesFiltersProps = {
  campaignId: string;
};

export function createResourcesFilters<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  _store: ResourceStore<R, L, F, DBR, DBT>,
  _context: ResourcesContext<R>,
  { Filters }: ResourcesFiltersExtra,
) {
  return Filters;
}
