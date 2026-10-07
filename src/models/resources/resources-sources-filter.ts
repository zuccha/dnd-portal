import z from "zod";
import { createLocalStoreSet } from "~/store/set/local-store-set";
import { hash } from "~/utils/hash";

//------------------------------------------------------------------------------
// Resources Sources Filter
//------------------------------------------------------------------------------

export const resourcesSourcesFilterSchema = z.record(z.string(), z.boolean().optional());

export type ResourcesSourcesFilter = z.infer<typeof resourcesSourcesFilterSchema>;

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

const useResourcesSourcesFilterStore = resourcesSourcesFilterStore.use;

export function useResourcesSourcesFilter(sourceId: string) {
  return useResourcesSourcesFilterStore(sourceId, defaultResourcesSourcesFilter);
}

//------------------------------------------------------------------------------
// Use Has Resources Sources Filter
//------------------------------------------------------------------------------

export function useHasResourcesSourcesFilter(sourceId: string): boolean {
  const [sources] = useResourcesSourcesFilter(sourceId);
  return hash(sources) !== hash(defaultResourcesSourcesFilter);
}
