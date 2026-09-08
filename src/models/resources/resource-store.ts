import { useCallback, useMemo } from "react";
import type { ZodType } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import { createCache } from "~/utils/cache";
import { createUseDerivedData } from "~/utils/derived-data";
import { hash } from "~/utils/hash";
import { compareObjects } from "~/utils/object";
import { createLockedRequest } from "~/utils/request";
import { normalizeString } from "~/utils/string";
import { createDeterministicUuid } from "~/utils/uuid";
import type { ResourceKind } from "../types/resource-kind";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import {
  type Resource,
  type ResourceOption,
  type TranslationFields,
} from "./resource";
import type { ResourceFilters } from "./resource-filters";
import { useResourcesSourcesFilter } from "./resources-sources-filter";

//------------------------------------------------------------------------------
// Resource Store
//------------------------------------------------------------------------------

export type ResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
> = ReturnType<typeof createResourceStore<R, L, F, DBR, DBT>>;

//------------------------------------------------------------------------------
// Virtual Resource Recipe
//------------------------------------------------------------------------------

export type VirtualResourceRecipe<R extends Resource> = {
  base_id: string;
  derive: (base: R, id: string) => R;
  modifier_ids: string[];
  source_id: string;
};

//------------------------------------------------------------------------------
// Create Resource Store
//------------------------------------------------------------------------------

export function createResourceStore<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  storeName: { p: string; s: string },
  {
    defaultFilters,
    defaultResource,
    displayName,
    filtersSchema,
    kind,
    resourceSchema: _resourceSchema,
    orderOptions,
    translationFields: _translationFields,
    useLocalizeResource,
  }: {
    defaultFilters: F;
    defaultResource: R;
    displayName: I18nString;
    filtersSchema: ZodType<F>;
    kind: ResourceKind;
    orderOptions: { label: I18nString; value: string }[];
    resourceSchema: ZodType<R>;
    translationFields: TranslationFields<R>[];
    useLocalizeResource: (sourceId: string) => (resource: R) => L;
  },
) {
  const storeId = `resources[${storeName.p}]`;
  const catalogueResourceStore = catalogue.createResourceStore(kind);

  //----------------------------------------------------------------------------
  // Filters
  //----------------------------------------------------------------------------

  const appliedFiltersStore = createLocalStore<F>(
    `${storeId}.filters.applied`,
    defaultFilters,
    filtersSchema.parse,
  );

  const filtersStore = createMemoryStore<F>(
    `${storeId}.filters.draft`,
    appliedFiltersStore.get(),
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filters
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilters(): [F, (partial: Partial<F>) => void] {
    const [filters, setFilters] = filtersStore.use();
    const setAppliedFilters = appliedFiltersStore.useSetValue();

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

  function useAppliedFilters(): F {
    return appliedFiltersStore.useValue();
  }

  function useEffectiveFilters(): F {
    const { name } = filtersStore.useValue();
    const appliedFilters = appliedFiltersStore.useValue();

    return { ...appliedFilters, name };
  }

  function useApplyFilters(): () => void {
    const filters = filtersStore.useValue();
    const setAppliedFilters = appliedFiltersStore.useSetValue();

    return useCallback(
      () => setAppliedFilters(filters),
      [filters, setAppliedFilters],
    );
  }

  function useResetFilters(): () => void {
    const setFilters = filtersStore.useSetValue();

    return useCallback(() => setFilters(defaultFilters), [setFilters]);
  }

  function useHasFilters(): boolean {
    const filters = filtersStore.useValue();

    return hash(filters) !== hash(defaultFilters);
  }

  function useHasFilterChanges(): boolean {
    const filters = filtersStore.useValue();
    const appliedFilters = appliedFiltersStore.useValue();
    const { name: _name, ...dbFilters } = filters;
    const { name: _appliedName, ...appliedDBFilters } = appliedFilters;

    return hash(dbFilters) !== hash(appliedDBFilters);
  }

  //----------------------------------------------------------------------------
  // Virtual Resources
  //----------------------------------------------------------------------------

  const virtualResourceIdsStore = createMemoryStore<Set<string>>(
    `${storeId}.virtual_resource_ids`,
    new Set(),
  );

  const virtualResourceRecipes = new Map<
    string,
    VirtualResourceRecipe<R> & { id: string }
  >();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Add Virtual Resource Recipe
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function addVirtualResourceRecipe(recipe: VirtualResourceRecipe<R>): boolean {
    const id = createDeterministicUuid([
      storeId,
      recipe.source_id,
      recipe.base_id,
      recipe.modifier_ids,
    ]);

    if (virtualResourceRecipes.has(id)) return false;

    virtualResourceRecipes.set(id, { ...recipe, id });
    refreshVirtualResource(id);
    virtualResourceIdsStore.set((prev) =>
      prev.has(id) ? prev : new Set([...prev, id]),
    );
    return true;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Remove Virtual Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function removeVirtualResource(resourceId: string): void {
    if (!virtualResourceRecipes.delete(resourceId)) return;

    resourceCache.remove(resourceId);
    resourceSelectionCache.remove(resourceId);

    virtualResourceIdsStore.set((prev) => {
      if (!prev.has(resourceId)) return prev;
      const next = new Set(prev);
      next.delete(resourceId);
      return next;
    });
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Merge Virtual Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function mergeVirtualResourceIds(
    sourceId: string,
    resourceIds: string[],
    virtualResourceIds: Set<string>,
  ): string[] {
    if (virtualResourceIds.size === 0) return resourceIds;

    const virtualIdsByBaseId: Record<string, string[]> = {};
    const eligibleVirtualResourceIds: string[] = [];

    for (const virtualResourceId of virtualResourceIds) {
      const recipe = virtualResourceRecipes.get(virtualResourceId);
      if (!recipe || recipe.source_id !== sourceId) continue;
      eligibleVirtualResourceIds.push(virtualResourceId);

      if (!virtualIdsByBaseId[recipe.base_id])
        virtualIdsByBaseId[recipe.base_id] = [];
      virtualIdsByBaseId[recipe.base_id]!.push(virtualResourceId);
    }

    const mergedResourceIds: string[] = [];

    for (const resourceId of resourceIds) {
      mergedResourceIds.push(resourceId);
      for (const virtualResourceId of virtualIdsByBaseId[resourceId] ?? [])
        mergedResourceIds.push(virtualResourceId);
    }

    return mergedResourceIds;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Refresh Virtual Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function refreshVirtualResource(resourceId: string): void {
    const recipe = virtualResourceRecipes.get(resourceId);
    if (!recipe) return;

    const base = getResource(recipe.base_id);
    if (!base) return;

    const resource = recipe.derive(base, recipe.id);
    resourceCache.set(recipe.id, { ...resource, id: recipe.id, virtual: true });
  }

  //----------------------------------------------------------------------------
  // Resources
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Create Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [createResource] = createLockedRequest(
    `${storeId}.create_resource`,
    undefined,
    async (
      _sourceId: string,
      _lang: string,
      _resource: Partial<DBR>,
      _translation: Partial<DBT>,
    ): Promise<string | undefined> => undefined,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Delete Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [deleteResources] = createLockedRequest(
    `${storeId}.delete_resources`,
    undefined,
    async (resourceIds: string[]): Promise<string | undefined> => {
      for (const resourceId of resourceIds) {
        resourceCache.remove(resourceId);
      }

      return undefined;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Resource Cache
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const resourceCache = createCache<string, R>(`${storeId}.resource`);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getResource(resourceId: string): R | undefined {
    const resource =
      resourceCache.get(resourceId) ??
      catalogueResourceStore.getResource(resourceId);
    return resource as R | undefined;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Update Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [updateResource] = createLockedRequest(
    `${storeId}.update_resource`,
    undefined,
    async (
      _resourceId: string,
      _lang: string,
      _resource: Partial<DBR>,
      _translation: Partial<DBT>,
    ): Promise<string | undefined> => undefined,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResource(resourceId: string): [R, string] {
    if (virtualResourceRecipes.has(resourceId)) {
      if (!resourceCache.get(resourceId)) refreshVirtualResource(resourceId);
    }

    const key = hash([resourceId]);
    const virtualResource = resourceCache.useValue(resourceId);
    const resource = catalogueResourceStore.useResource(resourceId);
    const result = [
      (virtualResource ?? resource ?? defaultResource) as R,
      key,
    ] as [R, string];
    return result;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResources(resourceIds: string[]): R[] {
    for (const resourceId of resourceIds) {
      if (virtualResourceRecipes.has(resourceId)) {
        if (!resourceCache.get(resourceId)) refreshVirtualResource(resourceId);
      }
    }

    const resources = catalogueResourceStore.useResources(resourceIds);
    const resourcesById = useMemo(
      () => new Map(resources.map((resource) => [resource.id, resource])),
      [resources],
    );
    const result = resourceIds.map(
      (id) => resourceCache.get(id) ?? resourcesById.get(id) ?? defaultResource,
    ) as R[];
    return result;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceIdsByParams(
    sourceId: string,
    _sources: Record<string, boolean | undefined>,
    _filters: Omit<F, "name">,
    _lang: string,
  ): [string[], string] {
    const resourceIds = catalogueResourceStore.useActiveSourceResourceIds();
    const key = hash([sourceId, resourceIds]);
    const virtualResourceIds = virtualResourceIdsStore.useValue();
    const mergedResourceIds = useMemo(
      () => mergeVirtualResourceIds(sourceId, resourceIds, virtualResourceIds),
      [resourceIds, sourceId, virtualResourceIds],
    );
    return [mergedResourceIds, key];
  }

  function useResourceIdsLoadingByParams(
    _sourceId: string,
    _sources: Record<string, boolean | undefined>,
    _filters: Omit<F, "name">,
    _lang: string,
  ): boolean {
    return false;
  }

  function useResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const { name: _name, ...filters } = useAppliedFilters();
    const [lang] = useI18nLang();
    const params = [sourceId, sources, filters, lang] as const;
    return useResourceIdsByParams(...params)[0];
  }

  function useAllResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const { name: _name, ...filters } = defaultFilters;
    const [lang] = useI18nLang();
    const params = [sourceId, sources, filters, lang] as const;
    return useResourceIdsByParams(...params)[0];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Filtered Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filtered Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilteredResourceIdsByParams(
    sourceId: string,
    sources: Record<string, boolean | undefined>,
    { name, ...filters }: F,
    lang: string,
  ): string[] {
    const normalizedName = normalizeString(name);
    const params = [sourceId, sources, filters, lang] as const;
    const [resourceIds] = useResourceIdsByParams(...params);

    const filteredResourceIds = useMemo(() => {
      const result = resourceIds.filter((resourceId) => {
        const resource = getResource(resourceId);
        if (!resource) return false;
        return Object.values(resource.name)
          .filter((name) => name)
          .some((name) => normalizeString(name!).includes(normalizedName));
      });
      return result;
    }, [normalizedName, resourceIds]);
    return filteredResourceIds;
  }

  function useFilteredResourceIds(sourceId: string): string[] {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const filters = useEffectiveFilters();
    const [lang] = useI18nLang();
    const params = [sourceId, sources, filters, lang] as const;
    return useFilteredResourceIdsByParams(...params);
  }

  function useFilteredResourceIdsLoading(sourceId: string): boolean {
    const [sources] = useResourcesSourcesFilter(sourceId);
    const { name: _name, ...filters } = useAppliedFilters();
    const [lang] = useI18nLang();
    const params = [sourceId, sources, filters, lang] as const;
    return useResourceIdsLoadingByParams(...params);
  }

  //----------------------------------------------------------------------------
  // Selection
  //----------------------------------------------------------------------------

  // resource id -> boolean
  const resourceSelectionCache = createCache<string, boolean>(
    `${storeId}.resource_selection`,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Subscribe Resource Selection
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const subscribeResourceSelections = (
    resourceIds: string[],
    callback: () => void,
  ) => {
    const unsubscribes = resourceIds.map((id) =>
      resourceSelectionCache.subscribe(id, callback),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Selection
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceSelection(resourceId: string): boolean {
    return resourceSelectionCache.useValue(resourceId) ?? false;
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
    sourceId: string,
    sources: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ) {
    const params = [sourceId, sources, filters, lang] as const;
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
    const params = [sourceId, sources, filters, lang] as const;
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
    const params = [sourceId, sources, filters, lang] as const;
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
    const resourceIds =
      catalogueResourceStore.useActiveSourceReferenceResourceIds();

    return useCallback(
      (resourceId: string) => {
        const resource = getResource(resourceId) ?? defaultResource;
        return translate(resource.name, lang);
      },
      [lang, resourceIds], // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name Short
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceNameShort(
    _sourceId: string,
    lang: string,
  ): (resourceId: string) => string {
    const resourceIds =
      catalogueResourceStore.useActiveSourceReferenceResourceIds();

    return useCallback(
      (resourceId: string) => {
        const resource = getResource(resourceId) ?? defaultResource;
        return translate(resource.name_short, lang);
      },
      [lang, resourceIds], // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResource(
    sourceId: string,
    resourceId: string,
  ): L | undefined {
    const [resource] = useResource(resourceId);
    const localizeResource = useLocalizeResource(sourceId);

    return useMemo(() => {
      return resource ? localizeResource(resource) : undefined;
    }, [localizeResource, resource]);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Options
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceOptionsByLang(
    _sourceId: string,
    lang: string,
  ): [ResourceOption[], string] {
    const resourceIds =
      catalogueResourceStore.useActiveSourceReferenceResourceIds();
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
    name: storeName,

    defaultResource,
    displayName,
    orderOptions,

    useApplyFilters,
    useFilters,
    useHasFilterChanges,
    useHasFilters,
    useResetFilters,

    addVirtualResourceRecipe,
    createResource,
    deleteResources,
    getResource,
    removeVirtualResource,
    updateResource,
    useAllResourceIds,
    useResource,
    useResourceIds,
    useResources,

    useFilteredResourceIds,
    useFilteredResourceIdsLoading,

    useResourceSelection,
    useResourceSelectionMethods,
    useResourcesSelectionMethods,
    useSelectedFilteredResourceIds,

    useLocalizeResource,
    useLocalizeResourceName,
    useLocalizeResourceNameShort,
    useLocalizedResource,
    useResourceOptions,
  };
}
