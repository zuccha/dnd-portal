import { useCallback, useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import {
  removeSourceBundleResources,
  upsertSourceBundleResource,
} from "~/models/catalogue/source-bundle";
import { updateSourceBundle } from "~/models/catalogue/source-bundle-indexed-db";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { createCache } from "~/utils/cache";
import { createUseDerivedData } from "~/utils/derived-data";
import { hash } from "~/utils/hash";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";
import { createUuid } from "~/utils/uuid";
import { type Resource, type ResourceOption, type TranslationFields } from "./resource";
import {
  type ResourceComparator,
  type ResourceMatcher,
  compareResources,
  matchesInclusion,
  matchesName,
} from "./resource-filtering";
import { mergeResourcePatch } from "./resource-patch";
import { useResourcesSourcesFilter } from "./resources-sources-filter";
import type { ResourceKind } from "../types/resource-kind";
import type { LocalizedResource } from "./localized-resource";
import type { ResourceFilters } from "./resource-filters";
import type { ZodType } from "zod";

//------------------------------------------------------------------------------
// Resource Store
//------------------------------------------------------------------------------

export type ResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
> = ReturnType<typeof createResourceStore<R, L, F>>;

//------------------------------------------------------------------------------
// Create Resource Store
//------------------------------------------------------------------------------

export function createResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(
  kind: ResourceKind,
  {
    defaultFilters,
    defaultResource,
    displayName,
    filtersSchema,
    matchesResource = () => true,
    compareResources: compareStoreResources = compareResources,
    orderOptions,
    translationFields,
    useLocalizeResource,
  }: {
    defaultFilters: F;
    defaultResource: R;
    displayName: I18nString;
    filtersSchema: ZodType<F>;
    matchesResource?: ResourceMatcher<R, F>;
    compareResources?: ResourceComparator<R, F>;
    orderOptions: { label: I18nString; value: string }[];
    translationFields: TranslationFields<R>[];
    useLocalizeResource: (sourceId: string) => (resource: R) => L;
  },
) {
  const storeId = `resources[${kind}]`;
  const catalogueResourceStore = catalogue.createResourceStore(kind);

  const {
    useResource: useCatalogueResource,
    useResources: useCatalogueResources,
    useActiveSourceReferenceResourceIds: useCatalogueActiveSourceReferenceResourceIds,
    useActiveSourceResourceIds: useCatalogueActiveSourceResourceIds,
  } = catalogueResourceStore;

  //----------------------------------------------------------------------------
  // Filters
  //----------------------------------------------------------------------------

  const appliedFiltersStore = createLocalStore<F>(
    `${storeId}.filters.applied`,
    defaultFilters,
    filtersSchema.parse,
  );

  const useAppliedFilters = appliedFiltersStore.useValue;
  const useSetAppliedFilters = appliedFiltersStore.useSetValue;

  const draftFiltersStore = createMemoryStore<F>(
    `${storeId}.filters.draft`,
    appliedFiltersStore.get(),
  );

  const useDraftFilters = draftFiltersStore.useValue;
  const useSetDraftFilters = draftFiltersStore.useSetValue;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filters
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilters(): [F, (partial: Partial<F>) => void] {
    const filters = useDraftFilters();
    const setFilters = useSetDraftFilters();
    const setAppliedFilters = useSetAppliedFilters();

    const setPartialFilters = useCallback(
      (partial: Partial<F>) => {
        if (partial.name !== undefined) {
          setAppliedFilters((prev) => ({ ...prev, name: partial.name! }));
        }

        setFilters((prev) => ({ ...prev, ...partial }));
      },
      [setAppliedFilters, setFilters],
    );

    return [filters, setPartialFilters];
  }

  function useEffectiveFilters(): F {
    const { name } = useDraftFilters();
    const appliedFilters = useAppliedFilters();

    return useMemo(() => ({ ...appliedFilters, name }), [appliedFilters, name]);
  }

  function useApplyFilters(): () => void {
    const filters = useDraftFilters();
    const setAppliedFilters = useSetAppliedFilters();

    return useCallback(() => setAppliedFilters(filters), [filters, setAppliedFilters]);
  }

  function useResetFilters(): () => void {
    const setFilters = useSetDraftFilters();

    return useCallback(() => setFilters(defaultFilters), [setFilters]);
  }

  function useHasFilters(): boolean {
    const filters = useDraftFilters();

    return hash(filters) !== hash(defaultFilters);
  }

  function useHasFilterChanges(): boolean {
    const filters = useDraftFilters();
    const appliedFilters = useAppliedFilters();
    const { name: _name, ...deferredFilters } = filters;
    const { name: _appliedName, ...appliedDeferredFilters } = appliedFilters;

    return hash(deferredFilters) !== hash(appliedDeferredFilters);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Add Temporary Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function addTemporaryResource(resource: R): boolean {
    if (!catalogue.isSourceEditable(resource.source_id)) return false;
    if (getResource(resource.id)) return false;

    catalogueResourceStore.upsertResource({ ...resource, virtual: true });
    return true;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Make Resource Persistent
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function makeResourcePersistent(resourceId: string): Promise<string | undefined> {
    const resource = getResource(resourceId);
    if (!resource) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(resource.source_id)) return "form.error.update_failure";
    if (!resource.virtual) return undefined;

    const persistentResource = { ...resource, virtual: false };

    try {
      await updateSourceBundle(resource.source_id, (bundle) =>
        upsertSourceBundleResource(bundle, persistentResource),
      );
      await catalogue.refreshSourceState(resource.source_id);
      catalogueResourceStore.upsertResource(persistentResource);
      return undefined;
    } catch (error) {
      console.error(`${storeId}.make_resource_persistent`, error);
      return "form.error.update_failure";
    }
  }

  //----------------------------------------------------------------------------
  // Resources
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function createResource(
    sourceId: string,
    resourcePatch: Partial<R>,
  ): Promise<string | undefined> {
    const source = catalogue.getSource(sourceId);
    if (!source) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(sourceId)) return "form.error.update_failure";

    const resource = {
      ...defaultResource,
      ...resourcePatch,
      id: resourcePatch.id ?? createUuid(),
      kind,
      source_code: source.code,
      source_id: source.id,
      source_version: source.version,
      virtual: false,
    } as R;

    try {
      await updateSourceBundle(source.id, (bundle) => upsertSourceBundleResource(bundle, resource));
      await catalogue.refreshSourceState(source.id);
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    } catch (error) {
      console.error(`${storeId}.create_resource`, error);
      return "form.error.update_failure";
    }
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Delete Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function deleteResources(resourceIds: string[]): Promise<string | undefined> {
    const resources = resourceIds
      .map(getResource)
      .filter((resource): resource is R => resource !== undefined);
    if (resources.some((resource) => !catalogue.isSourceEditable(resource.source_id)))
      return "form.error.update_failure";

    const sourceIds = [
      ...new Set(
        resources.filter((resource) => !resource.virtual).map(({ source_id }) => source_id),
      ),
    ];

    try {
      await Promise.all(
        sourceIds.map((sourceId) => {
          const ids = resources
            .filter((resource) => resource.source_id === sourceId)
            .map(({ id }) => id);

          return updateSourceBundle(sourceId, (bundle) =>
            removeSourceBundleResources(bundle, kind, ids),
          );
        }),
      );
      await Promise.all(sourceIds.map((sourceId) => catalogue.refreshSourceState(sourceId)));

      for (const resource of resources) catalogueResourceStore.removeResource(resource.id);
      for (const resource of resources) resourceSelectionCache.remove(resource.id);

      return undefined;
    } catch (error) {
      console.error(`${storeId}.delete_resources`, error);
      return "form.error.update_failure";
    }
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getResource(resourceId: string): R | undefined {
    return catalogueResourceStore.getResource(resourceId) as R | undefined;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Update Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  async function updateResource(
    resourceId: string,
    resourcePatch: Partial<R>,
  ): Promise<string | undefined> {
    const current = getResource(resourceId);
    if (!current) return "form.error.update_failure";
    if (!catalogue.isSourceEditable(current.source_id)) return "form.error.update_failure";

    const resource = mergeResourcePatch(
      current,
      {
        ...resourcePatch,
        id: current.id,
        kind: current.kind,
        source_code: current.source_code,
        source_id: current.source_id,
        source_version: current.source_version,
      },
      translationFields,
    );

    if (resource.virtual) {
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    }

    try {
      await updateSourceBundle(resource.source_id, (bundle) =>
        upsertSourceBundleResource(bundle, resource),
      );
      await catalogue.refreshSourceState(resource.source_id);
      catalogueResourceStore.upsertResource(resource);
      return undefined;
    } catch (error) {
      console.error(`${storeId}.update_resource`, error);
      return "form.error.update_failure";
    }
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResource(resourceId: string): R {
    const resource = useCatalogueResource(resourceId);
    return (resource ?? defaultResource) as R;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResources(resourceIds: string[]): R[] {
    const resources = useCatalogueResources(resourceIds);
    const resourcesById = useMemo(
      () => new Map(resources.map((resource) => [resource.id, resource])),
      [resources],
    );
    const result = resourceIds.map((id) => resourcesById.get(id) ?? defaultResource) as R[];
    return result;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Ids By Params
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceIdsByParams(sources: Record<string, boolean | undefined>): string[] {
    const resourceIds = useCatalogueActiveSourceResourceIds();
    const sourceFilteredResourceIds = useMemo(
      () =>
        resourceIds.filter((resourceId) => {
          const resource = getResource(resourceId);
          return resource && matchesInclusion(resource.source_id, sources);
        }),
      [resourceIds, sources],
    );
    return sourceFilteredResourceIds;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const params = [sources] as const;
    return useResourceIdsByParams(...params);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filtered Resource Ids Py Params
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilteredResourceIdsByParams(
    sources: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ): string[] {
    const normalizedName = normalizeString(filters.name);
    const params = [sources] as const;
    const resourceIds = useResourceIdsByParams(...params);

    const filteredResourceIds = useMemo(() => {
      const result = resourceIds
        .filter((resourceId) => {
          const resource = getResource(resourceId);
          if (!resource) return false;
          return matchesName(resource, normalizedName) && matchesResource(resource, filters);
        })
        .sort((aId, bId) => {
          const a = getResource(aId);
          const b = getResource(bId);
          if (!a || !b) return 0;
          return compareStoreResources(a, b, filters, lang);
        });
      return result;
    }, [filters, lang, normalizedName, resourceIds]);
    return filteredResourceIds;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filtered Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilteredResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const filters = useEffectiveFilters();
    const [lang] = useI18nLang();
    const params = [sources, filters, lang] as const;
    return useFilteredResourceIdsByParams(...params);
  }

  //----------------------------------------------------------------------------
  // Selection
  //----------------------------------------------------------------------------

  // resource id -> boolean
  const resourceSelectionCache = createCache<string, boolean>(`${storeId}.resource_selection`);
  const useResourceSelectionCache = resourceSelectionCache.useValue;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Subscribe Resource Selection
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const subscribeResourceSelections = (resourceIds: string[], callback: () => void) => {
    const unsubscribes = resourceIds.map((id) => resourceSelectionCache.subscribe(id, callback));
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Selection
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceSelection(resourceId: string): boolean {
    return useResourceSelectionCache(resourceId) ?? false;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Selection Methods
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceSelectionMethods(resourceId: string) {
    const deselectResource = useCallback(() => {
      resourceSelectionCache.remove(resourceId);
    }, [resourceId]);

    const selectResource = useCallback(() => {
      resourceSelectionCache.set(resourceId, true);
    }, [resourceId]);

    const setResourceSelection = useCallback(
      (selection: boolean) => {
        resourceSelectionCache.set(resourceId, selection);
      },
      [resourceId],
    );

    const toggleResourceSelection = useCallback(() => {
      const prev = resourceSelectionCache.get(resourceId);
      resourceSelectionCache.set(resourceId, !prev);
    }, [resourceId]);

    return {
      deselectResource,
      selectResource,
      setResourceSelection,
      toggleResourceSelection,
    };
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resources Selection Methods
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourcesSelectionMethodsByParams(
    sources: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ) {
    const params = [sources, filters, lang] as const;
    const filteredResourceIds = useFilteredResourceIdsByParams(...params);

    const deselectAllResources = useCallback(() => {
      filteredResourceIds.forEach(resourceSelectionCache.remove);
    }, [filteredResourceIds]);

    const selectAllResources = useCallback(() => {
      filteredResourceIds.forEach((id) => resourceSelectionCache.set(id, true));
    }, [filteredResourceIds]);

    return {
      deselectAllResources,
      selectAllResources,
    };
  }

  function useResourcesSelectionMethods(sourceId: string) {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const filters = useEffectiveFilters();
    const [lang] = useI18nLang();
    const params = [sources, filters, lang] as const;
    return useResourcesSelectionMethodsByParams(...params);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Selected Filtered Resources Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [useSelectedFilteredResourceIdsWithKey] = createUseDerivedData(
    (resourceIds: string[]) => resourceIds.filter(resourceSelectionCache.get),
    subscribeResourceSelections,
  );

  function useSelectedFilteredResourceIdsByParams(
    sourceId: string,
    sources: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ): string[] {
    const params = [sources, filters, lang] as const;
    const filteredResourceIds = useFilteredResourceIdsByParams(...params);
    const key = sourceId;
    return useSelectedFilteredResourceIdsWithKey(key, filteredResourceIds)[0];
  }

  function useSelectedFilteredResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const filters = useEffectiveFilters();
    const [lang] = useI18nLang();
    const params = [sourceId, sources, filters, lang] as const;
    return useSelectedFilteredResourceIdsByParams(...params);
  }

  //----------------------------------------------------------------------------
  // Localization
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceName(
    _sourceId: string,
    lang: string,
  ): (resourceId: string) => string {
    const resourceIds = useCatalogueActiveSourceReferenceResourceIds();
    const resourcesById = useMemo(
      () => new Map(resourceIds.map((id) => [id, getResource(id) ?? defaultResource])),
      [resourceIds],
    );

    return useCallback(
      (resourceId: string) => {
        const resource = resourcesById.get(resourceId) ?? defaultResource;
        return translate(resource.name, lang);
      },
      [lang, resourcesById],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name Short
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceNameShort(
    _sourceId: string,
    lang: string,
  ): (resourceId: string) => string {
    const resourceIds = useCatalogueActiveSourceReferenceResourceIds();
    const resourcesById = useMemo(
      () => new Map(resourceIds.map((id) => [id, getResource(id) ?? defaultResource])),
      [resourceIds],
    );

    return useCallback(
      (resourceId: string) => {
        const resource = resourcesById.get(resourceId) ?? defaultResource;
        return translate(resource.name_short, lang);
      },
      [lang, resourcesById],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Options
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceOptionsByLang(_sourceId: string, lang: string): [ResourceOption[], string] {
    const resourceIds = useCatalogueActiveSourceReferenceResourceIds();
    const key = hash([resourceIds, lang]);

    return [
      resourceIds
        .map((id) => {
          const resource = getResource(id) ?? defaultResource;
          const label = translate(resource.name, lang);
          return {
            label,
            name: resource.name,
            name_short: resource.name_short,
            value: resource.id,
          };
        })
        .sort(compareObjects("label")),
      key,
    ];
  }

  function useResourceOptions(sourceId: string): ResourceOption[] {
    const [lang] = useI18nLang();
    return useResourceOptionsByLang(sourceId, lang)[0];
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: storeId,
    kind,

    defaultResource,
    displayName,
    orderOptions,
    translationFields,

    useApplyFilters,
    useFilters,
    useHasFilterChanges,
    useHasFilters,
    useResetFilters,

    addTemporaryResource,
    createResource,
    deleteResources,
    getResource,
    makeResourcePersistent,
    updateResource,
    useResource,
    useResourceIds,
    useResources,

    useFilteredResourceIds,

    useResourceSelection,
    useResourceSelectionMethods,
    useResourcesSelectionMethods,
    useSelectedFilteredResourceIds,

    useLocalizeResource,
    useLocalizeResourceName,
    useLocalizeResourceNameShort,
    useResourceOptions,
  };
}
