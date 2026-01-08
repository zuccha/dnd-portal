import { useCallback, useMemo } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { createLocalStore } from "~/store/local-store";
import supabase from "~/supabase";
import { createCache } from "~/utils/cache";
import { hash } from "~/utils/hash";
import { compareObjects } from "~/utils/object";
import { createUseProcessedData } from "~/utils/processed-data";
import { createCachedRequest, createLockedRequest } from "~/utils/request";
import { normalizeString } from "~/utils/string";
import type { ResourceKind } from "../types/resource-kind";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import {
  type Resource,
  type ResourceLookup,
  type ResourceOption,
  type TranslationFields,
  defaultResourceLookup,
  resourceLookupSchema,
} from "./resource";
import type { ResourceFilters } from "./resource-filters";
import { useResourcesModulesFilter } from "./resources-modules-filter";

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
    filtersSchema,
    kinds,
    resourceSchema,
    orderOptions,
    translationFields,
    useLocalizeResource,
  }: {
    defaultFilters: F;
    defaultResource: R;
    filtersSchema: ZodType<F>;
    kinds: ResourceKind[];
    orderOptions: { label: I18nString; value: string }[];
    resourceSchema: ZodType<R>;
    translationFields: TranslationFields<R>[];
    useLocalizeResource: (campaignId: string) => (resource: R) => L;
  },
) {
  const storeId = `resources[${storeName.p}]`;
  const emptyIds: string[] = [];

  //----------------------------------------------------------------------------
  // Filters
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore<F>(
    `${storeId}.filters`,
    defaultFilters,
    filtersSchema.parse,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filters
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useFilters(): [F, (partial: Partial<F>) => void] {
    const [filters, setFilters] = filtersStore.use();

    const setPartialFilters = useCallback(
      (partial: Partial<F>) => setFilters((prev) => ({ ...prev, ...partial })),
      [setFilters],
    );

    return [filters, setPartialFilters];
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
      campaignId: string,
      lang: string,
      resource: Partial<DBR>,
      translation: Partial<DBT>,
    ): Promise<string | undefined> => {
      const { error } = await supabase.rpc(`create_${storeName.s}`, {
        p_campaign_id: campaignId,
        p_lang: lang,
        [`p_${storeName.s}`]: resource,
        [`p_${storeName.s}_translation`]: translation,
      });

      if (error) throw error;

      resourceIdsCache.invalidateAll();
      resourceLookupIdsCache.invalidateAll();

      return undefined;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Delete Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [deleteResources] = createLockedRequest(
    `${storeId}.delete_resources`,
    undefined,
    async (resourceIds: string[]): Promise<string | undefined> => {
      const { error } = await supabase
        .from("resources")
        .delete()
        .in("id", resourceIds);

      if (error) throw error;

      resourceIdsCache.invalidateAll();
      resourceLookupIdsCache.invalidateAll();

      for (const resourceId of resourceIds) {
        resourceCache.invalidate(resourceId);
        resourceLookupCache.invalidate(resourceId);
      }

      return undefined;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Fetch Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // TODO: Fetch resource by lang, and check if the given lang exists.
  const [fetchResource, resourceCache] = createCachedRequest(
    `${storeId}.resource`,
    defaultResource,
    async (resourceId: string): Promise<R> => {
      const { data, error } = await supabase.rpc(`fetch_${storeName.s}`, {
        p_id: resourceId,
      });

      if (error) throw error;

      const resource = resourceSchema.optional().parse(data);
      if (!resource)
        throw new Error(`${storeName.s} (${resourceId}) not found`);

      return resource;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Fetch Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [fetchResourceIds, resourceIdsCache] = createCachedRequest(
    `${storeId}.resource_ids`,
    [],
    async (
      campaignId: string,
      modules: Record<string, boolean | undefined>,
      filters: Omit<F, "name">,
      lang: string,
    ): Promise<string[]> => {
      const { order_by, order_dir, ...other } = filters;
      const { data, error } = await supabase.rpc(`fetch_${storeName.p}`, {
        p_campaign_id: campaignId,
        p_filters: { ...other, campaigns: modules },
        p_langs: [lang],
        p_order_by: order_by,
        p_order_dir: order_dir,
      });

      if (error) throw error;

      const resources = z.array(resourceSchema).parse(data);
      const resourceIds = resources.map(({ id }) => id);

      for (const resource of resources) {
        const prev = resourceCache.get(resource.id) ?? defaultResource;
        const merged = { ...prev, ...resource };
        for (const translationField of translationFields) {
          merged[translationField] = {
            ...prev[translationField],
            ...resource[translationField],
          };
        }
        resourceCache.set(merged, resource.id);
      }

      return resourceIds;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Fetch Resource Lookup
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [fetchResourceLookup, resourceLookupCache] = createCachedRequest(
    `${storeId}.resource_lookup`,
    defaultResourceLookup,
    async (resourceId: string): Promise<ResourceLookup> => {
      const { data, error } = await supabase.rpc(`fetch_resource_lookup`, {
        p_id: resourceId,
      });

      if (error) throw error;

      const lookup = z.array(resourceLookupSchema).parse(data);
      if (!lookup.length)
        throw new Error(`${storeName.s} lookup (${resourceId}) not found`);

      return lookup[0]!;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Fetch Resource Lookup Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [fetchResourceLookupIds, resourceLookupIdsCache] = createCachedRequest(
    `${storeId}.lookup_ids`,
    [],
    async (campaignId: string): Promise<string[]> => {
      if (!campaignId) return [];

      const { data, error } = await supabase.rpc(`fetch_resource_lookups`, {
        p_campaign_id: campaignId,
        p_resource_kinds: kinds,
      });

      if (error) throw error;

      const lookups = z.array(resourceLookupSchema).parse(data);
      const lookupIds = lookups.map((lookup) => lookup.id);
      for (const lookup of lookups) resourceLookupCache.set(lookup, lookup.id);

      return lookupIds;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Update Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [updateResource] = createLockedRequest(
    `${storeId}.update_resource`,
    undefined,
    async (
      resourceId: string,
      lang: string,
      resource: Partial<DBR>,
      translation: Partial<DBT>,
    ): Promise<string | undefined> => {
      const { error } = await supabase.rpc(`update_${storeName.s}`, {
        p_id: resourceId,
        p_lang: lang,
        [`p_${storeName.s}`]: resource,
        [`p_${storeName.s}_translation`]: translation,
      });

      if (error) throw error;

      resourceCache.invalidate(resourceId);
      resourceIdsCache.invalidateAll();
      resourceLookupCache.invalidate(resourceId);
      resourceLookupIdsCache.invalidateAll();

      return undefined;
    },
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResource(resourceId: string): [R, string] {
    const { key } = fetchResource(resourceId);
    return [resourceCache.cache.useValue(key) ?? defaultResource, key];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceIdsByParams(
    campaignId: string,
    modules: Record<string, boolean | undefined>,
    filters: Omit<F, "name">,
    lang: string,
  ): [string[], string] {
    const { key } = fetchResourceIds(campaignId, modules, filters, lang);
    return [resourceIdsCache.cache.useValue(key) ?? emptyIds, key];
  }

  function useResourceIds(campaignId: string): string[] {
    const [modules] = useResourcesModulesFilter(campaignId);
    const [{ name: _name, ...filters }] = useFilters();
    const [lang] = useI18nLang();
    const params = [campaignId, modules, filters, lang] as const;
    return useResourceIdsByParams(...params)[0];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Lookup
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceLookup(resourceId: string): [ResourceLookup, string] {
    const { key } = fetchResourceLookup(resourceId);
    return [
      resourceLookupCache.cache.useValue(key) ?? defaultResourceLookup,
      key,
    ];
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Lookup Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useResourceLookupIds(campaignId: string): [string[], string] {
    const { key } = fetchResourceLookupIds(campaignId);
    return [resourceLookupIdsCache.cache.useValue(key) ?? emptyIds, key];
  }

  //----------------------------------------------------------------------------
  // Filtered Resources
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Filtered Resource Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [useFilteredResourceIdsWithKey] = createUseProcessedData(
    (resourceIds: string[], partialName: string) => {
      return resourceIds.filter((resourceId) => {
        const resource = resourceCache.get(resourceId);
        if (!resource) return false;
        return Object.values(resource.name)
          .filter((name) => name)
          .some((name) => normalizeString(name!).includes(partialName));
      });
    },
    resourceCache.cache.subscribe,
  );

  function useFilteredResourceIdsByParams(
    campaignId: string,
    modules: Record<string, boolean | undefined>,
    { name, ...filters }: F,
    lang: string,
  ): string[] {
    const normalizedName = normalizeString(name);
    const params = [campaignId, modules, filters, lang] as const;
    const [resourceIds] = useResourceIdsByParams(...params);
    const key = campaignId;
    return useFilteredResourceIdsWithKey(key, resourceIds, normalizedName)[0];
  }

  function useFilteredResourceIds(campaignId: string): string[] {
    const [modules] = useResourcesModulesFilter(campaignId);
    const [filters] = useFilters();
    const [lang] = useI18nLang();
    const params = [campaignId, modules, filters, lang] as const;
    return useFilteredResourceIdsByParams(...params);
  }

  //----------------------------------------------------------------------------
  // Selection
  //----------------------------------------------------------------------------

  // resource id -> boolean
  const resourceSelectionCache = createCache<string, boolean>(
    `${storeId}.resource_selection`,
  );

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Get Selected Resources
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function getSelectedResources(campaignId: string): R[] {
    const resources: R[] = [];

    for (const [resourceId, selected] of resourceSelectionCache.entries()) {
      const resource = resourceCache.get(resourceId) ?? defaultResource;
      if (selected && resource.campaign_id === campaignId)
        resources.push(resource);
    }

    return resources;
  }

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
    campaignId: string,
    modules: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ) {
    const params = [campaignId, modules, filters, lang] as const;
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

  function useResourcesSelectionMethods(campaignId: string) {
    const [modules] = useResourcesModulesFilter(campaignId);
    const [filters] = useFilters();
    const [lang] = useI18nLang();
    const params = [campaignId, modules, filters, lang] as const;
    return useResourcesSelectionMethodsByParams(...params);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Selected Filtered Resources Ids
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [useSelectedFilteredResourceIdsWithKey] = createUseProcessedData(
    (resourceIds: string[]) => resourceIds.filter(resourceSelectionCache.get),
    resourceSelectionCache.subscribe,
  );

  function useSelectedFilteredResourceIdsByParams(
    campaignId: string,
    modules: Record<string, boolean | undefined>,
    filters: F,
    lang: string,
  ): string[] {
    const params = [campaignId, modules, filters, lang] as const;
    const filteredResourceIds = useFilteredResourceIdsByParams(...params);
    const key = campaignId;
    return useSelectedFilteredResourceIdsWithKey(key, filteredResourceIds)[0];
  }

  function useSelectedFilteredResourceIds(campaignId: string): string[] {
    const [modules] = useResourcesModulesFilter(campaignId);
    const [filters] = useFilters();
    const [lang] = useI18nLang();
    const params = [campaignId, modules, filters, lang] as const;
    return useSelectedFilteredResourceIdsByParams(...params);
  }

  //----------------------------------------------------------------------------
  // Localization
  //----------------------------------------------------------------------------

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localize Resource Name
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizeResourceName(
    campaignId: string,
    lang: string,
  ): (resourceId: string) => string {
    useResourceLookupIds(campaignId);

    return useCallback(
      (resourceId: string) => {
        const lookup =
          resourceLookupCache.get(resourceId) ?? defaultResourceLookup;
        return translate(lookup.name, lang);
      },
      [lang],
    );
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Localized Resource
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function useLocalizedResource(resourceId: string): L | undefined {
    const [resource] = useResource(resourceId);
    const localizeResource = useLocalizeResource(resource?.campaign_id ?? "");

    return useMemo(() => {
      return resource ? localizeResource(resource) : undefined;
    }, [localizeResource, resource]);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Use Resource Options
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const [useCachedResourceOptions] = createUseProcessedData(
    (lookupIds: string[], lang: string) =>
      lookupIds
        .map((id) => {
          const lookup = resourceLookupCache.get(id) ?? defaultResourceLookup;
          const label = translate(lookup.name, lang);
          return { label, name: lookup.name, value: lookup.id };
        })
        .sort(compareObjects("label")),
    resourceLookupCache.cache.subscribe,
  );

  function useResourceOptionsByLang(
    campaignId: string,
    lang: string,
  ): [ResourceOption[], string] {
    const [lookupIds, lookupIdsKey] = useResourceLookupIds(campaignId);
    const key = hash([lookupIdsKey, lang]);

    return useCachedResourceOptions(key, lookupIds, lang);
  }

  function useResourceOptions(campaignId: string): ResourceOption[] {
    const [lang] = useI18nLang();
    return useResourceOptionsByLang(campaignId, lang)[0];
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: storeId,
    name: storeName,

    defaultResource,
    orderOptions,

    useFilters,

    createResource,
    deleteResources,
    fetchResource,
    fetchResourceIds,
    fetchResourceLookup,
    fetchResourceLookupIds,
    updateResource,
    useResource,
    useResourceIds,
    useResourceLookup,
    useResourceLookupIds,

    useFilteredResourceIds,

    getSelectedResources,
    useResourceSelection,
    useResourceSelectionMethods,
    useResourcesSelectionMethods,
    useSelectedFilteredResourceIds,

    useLocalizeResource,
    useLocalizeResourceName,
    useLocalizedResource,
    useResourceOptions,
  };
}
