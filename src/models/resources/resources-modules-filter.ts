import z from "zod";
import { createLocalStoreSet } from "~/store/set/local-store-set";

//------------------------------------------------------------------------------
// Resources Modules Filter
//------------------------------------------------------------------------------

export const resourcesModulesFilterSchema = z.record(
  z.string(),
  z.boolean().optional(),
);

export type ResourcesModulesFilter = z.infer<
  typeof resourcesModulesFilterSchema
>;

export const defaultResourcesModulesFilter = {};

//------------------------------------------------------------------------------
// Resources Modules Filter Store
//------------------------------------------------------------------------------

const resourcesModulesFilterStore = createLocalStoreSet<ResourcesModulesFilter>(
  "resources.filters.modules",
  {},
  resourcesModulesFilterSchema.parse,
);

//------------------------------------------------------------------------------
// Use Resources Modules Filter
//------------------------------------------------------------------------------

export function useResourcesModulesFilter(campaignId: string) {
  return resourcesModulesFilterStore.use(
    campaignId,
    defaultResourcesModulesFilter,
  );
}
