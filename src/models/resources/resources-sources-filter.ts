import { useCallback } from "react";
import z from "zod";
import { createLocalStoreSet } from "~/store/set/local-store-set";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import { hash } from "~/utils/hash";

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

const draftResourcesSourcesFilterStore = createMemoryStoreSet<
  string,
  ResourcesSourcesFilter
>("resources.filters.modules.draft");

//------------------------------------------------------------------------------
// Use Resources Sources Filter
//------------------------------------------------------------------------------

export function useResourcesSourcesFilter(sourceId: string) {
  return resourcesSourcesFilterStore.use(
    sourceId,
    defaultResourcesSourcesFilter,
  );
}

//------------------------------------------------------------------------------
// Use Draft Resources Sources Filter
//------------------------------------------------------------------------------

export function useDraftResourcesSourcesFilter(sourceId: string) {
  const defaultValue = resourcesSourcesFilterStore.get(
    sourceId,
    defaultResourcesSourcesFilter,
  );

  return draftResourcesSourcesFilterStore.use(sourceId, defaultValue);
}

//------------------------------------------------------------------------------
// Use Apply Resources Sources Filter
//------------------------------------------------------------------------------

export function useApplyResourcesSourcesFilter(sourceId: string): () => void {
  const [draftSources] = useDraftResourcesSourcesFilter(sourceId);
  const [, setSources] = useResourcesSourcesFilter(sourceId);

  return useCallback(
    () => setSources(draftSources),
    [draftSources, setSources],
  );
}

//------------------------------------------------------------------------------
// Use Reset Draft Resources Sources Filter
//------------------------------------------------------------------------------

export function useResetDraftResourcesSourcesFilter(
  sourceId: string,
): () => void {
  const [, setDraftSources] = useDraftResourcesSourcesFilter(sourceId);

  return useCallback(
    () => setDraftSources(defaultResourcesSourcesFilter),
    [setDraftSources],
  );
}

//------------------------------------------------------------------------------
// Use Has Draft Resources Sources Filter
//------------------------------------------------------------------------------

export function useHasDraftResourcesSourcesFilter(sourceId: string): boolean {
  const [draftSources] = useDraftResourcesSourcesFilter(sourceId);

  return hash(draftSources) !== hash(defaultResourcesSourcesFilter);
}

//------------------------------------------------------------------------------
// Use Has Resources Sources Filter
//------------------------------------------------------------------------------

export function useHasResourcesSourcesFilterChanges(sourceId: string): boolean {
  const [draftSources] = useDraftResourcesSourcesFilter(sourceId);
  const [sources] = useResourcesSourcesFilter(sourceId);

  return hash(draftSources) !== hash(sources);
}
