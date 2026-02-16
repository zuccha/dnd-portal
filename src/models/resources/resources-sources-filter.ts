import z from "zod";
import { createLocalStoreSet } from "~/store/set/local-store-set";

//------------------------------------------------------------------------------
// Resources Sources Filter
//------------------------------------------------------------------------------

export const resourcesSourcesFilterSchema = z.record(
  z.string(),
  z.boolean().optional(),
);

export type ResourcesSourcesFilter = z.infer<
  typeof resourcesSourcesFilterSchema
>;

export const defaultResourcesSourcesFilter = {};

//------------------------------------------------------------------------------
// Resources Sources Filter Store
//------------------------------------------------------------------------------

const resourcesSourcesFilterStore = createLocalStoreSet<ResourcesSourcesFilter>(
  "resources.filters.modules",
  {},
  resourcesSourcesFilterSchema.parse,
);

//------------------------------------------------------------------------------
// Use Resources Sources Filter
//------------------------------------------------------------------------------

export function useResourcesSourcesFilter(sourceId: string) {
  return resourcesSourcesFilterStore.use(
    sourceId,
    defaultResourcesSourcesFilter,
  );
}
