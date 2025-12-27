import { useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import supabase, { queryClient } from "~/supabase";
import type { StateSetter } from "~/utils/state";
import { normalizeString } from "~/utils/string";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import type { Resource, ResourceFilters } from "./resource";
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
    resourceSchema,
    useLocalizeResource,
  }: {
    defaultFilters: F;
    defaultResource: R;
    filtersSchema: ZodType<F>;
    resourceSchema: ZodType<R>;
    useLocalizeResource: () => (resource: R) => L;
  },
) {
  const storeId = `resources[${storeName.p}]`;
  const fetchResourceId = `${storeId}.fetch_resource`;
  const fetchResourcesId = `${storeId}.fetch_resources`;

  const emptyResourceIds: string[] = [];
  const emptyResources: R[] = [];

  //----------------------------------------------------------------------------
  // Resources Ids Store
  //----------------------------------------------------------------------------

  // campaign id -> resource id[]
  const resourceIdsStore = createMemoryStoreSet<string, string[]>(
    `${storeId}.resource_ids`,
  );

  //----------------------------------------------------------------------------
  // Filtered Resources Ids Store
  //----------------------------------------------------------------------------

  // campaign id -> resource id[]
  const filteredResourceIdsStore = createMemoryStoreSet<string, string[]>(
    `${storeId}.filtered_resource_ids`,
  );

  //----------------------------------------------------------------------------
  // Resources Store
  //----------------------------------------------------------------------------

  // resource id -> resource
  const resourcesStore = createMemoryStoreSet<string, R>(
    `${storeId}.resources`,
  );

  //----------------------------------------------------------------------------
  // Resource Selection Store
  //----------------------------------------------------------------------------

  // resource id -> boolean
  const resourceSelectionStore = createMemoryStoreSet<string, boolean>(
    `${storeId}.resource_selection`,
  );

  // campaign id -> number
  const resourceSelectionCountStore = createMemoryStoreSet<string, number>(
    `${storeId}.resource_selection_count`,
  );

  //----------------------------------------------------------------------------
  // Filters Store
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore<F>(
    `${storeId}.filters`,
    defaultFilters,
    filtersSchema.parse,
  );

  //----------------------------------------------------------------------------
  // Create Resource
  //----------------------------------------------------------------------------

  async function createResource(
    campaignId: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>,
  ): Promise<string | undefined> {
    const { error } = await supabase.rpc(`create_${storeName.s}`, {
      p_campaign_id: campaignId,
      p_lang: lang,
      [`p_${storeName.s}`]: resource,
      [`p_${storeName.s}_translation`]: translation,
    });

    if (error) return error.message;

    queryClient.invalidateQueries({ queryKey: [fetchResourcesId] });

    return undefined;
  }

  //----------------------------------------------------------------------------
  // Delete Resources
  //----------------------------------------------------------------------------

  async function deleteResources(
    campaignId: string,
    resourceIds: string[],
  ): Promise<string | undefined> {
    const { error } = await supabase
      .from("resources")
      .delete()
      .in("id", resourceIds);

    if (error) return error.message;

    queryClient.invalidateQueries({ queryKey: [fetchResourcesId] });
    for (const resourceId of resourceIds) {
      const queryKey = [fetchResourceId, resourceId];
      queryClient.invalidateQueries({ queryKey });
      deselectResource(campaignId, resourceId);
    }

    return undefined;
  }

  //----------------------------------------------------------------------------
  // Deselect All Resources
  //----------------------------------------------------------------------------

  function deselectAllResources(campaignId: string): void {
    const resourceIds = filteredResourceIdsStore.get(
      campaignId,
      emptyResourceIds,
    );
    resourceIds.forEach((id) => resourceSelectionStore.set(id, false, false));
    resourceSelectionCountStore.set(campaignId, 0, 0);
  }

  //----------------------------------------------------------------------------
  // Deselect Resource
  //----------------------------------------------------------------------------

  function deselectResource(campaignId: string, resourceId: string): void {
    resourceSelectionStore.set(resourceId, false, (prev) => {
      const variation = prev ? -1 : 0;
      resourceSelectionCountStore.set(
        campaignId,
        0,
        (count) => count + variation,
      );
      return prev;
    });
  }

  //----------------------------------------------------------------------------
  // Fetch Resource
  //----------------------------------------------------------------------------

  async function fetchResource(resourceId: string): Promise<R | undefined> {
    const { data } = await supabase.rpc(`fetch_${storeName.s}`, {
      p_id: resourceId,
    });
    try {
      return resourceSchema.parse(data);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  //----------------------------------------------------------------------------
  // Fetch Resources
  //----------------------------------------------------------------------------

  async function fetchResources(
    campaignId: string,
    modules: Record<string, boolean | undefined>,
    { order_by, order_dir, ...filters }: Omit<F, "name">,
    lang: string,
  ): Promise<R[]> {
    const { data } = await supabase.rpc(`fetch_${storeName.p}`, {
      p_campaign_id: campaignId,
      p_filters: { ...filters, campaigns: modules },
      p_langs: [lang],
      p_order_by: order_by,
      p_order_dir: order_dir,
    });
    try {
      const resources = z.array(resourceSchema).parse(data);
      for (const resource of resources)
        queryClient.setQueryData([fetchResourceId, resource.id], resource);
      return resources;
    } catch (e) {
      console.error(e);
      return emptyResources;
    }
  }

  //----------------------------------------------------------------------------
  // Get Selected Resources
  //----------------------------------------------------------------------------

  function getSelectedResources(campaignId: string): R[] {
    const resourceIds = filteredResourceIdsStore.get(
      campaignId,
      emptyResourceIds,
    );
    return resourceIds
      .filter((id) => resourceSelectionStore.get(id, false))
      .map((id) => resourcesStore.get(id, defaultResource));
  }

  //----------------------------------------------------------------------------
  // Select All Resources
  //----------------------------------------------------------------------------

  function selectAllResources(campaignId: string): void {
    const resourceIds = filteredResourceIdsStore.get(
      campaignId,
      emptyResourceIds,
    );
    resourceIds.forEach((id) => resourceSelectionStore.set(id, true, true));
    resourceSelectionCountStore.set(campaignId, 0, resourceIds.length);
  }

  //----------------------------------------------------------------------------
  // Select Resource
  //----------------------------------------------------------------------------

  function selectResource(campaignId: string, resourceId: string): void {
    resourceSelectionStore.set(resourceId, false, (prev) => {
      const variation = prev ? 0 : 1;
      resourceSelectionCountStore.set(
        campaignId,
        0,
        (count) => count + variation,
      );
      return prev;
    });
  }

  //----------------------------------------------------------------------------
  // Toggle Resource Selection
  //----------------------------------------------------------------------------

  function toggleResourceSelection(
    campaignId: string,
    resourceId: string,
  ): void {
    resourceSelectionStore.set(resourceId, false, (prev) => {
      const variation = prev ? -1 : 1;
      resourceSelectionCountStore.set(
        campaignId,
        0,
        (count) => count + variation,
      );
      return !prev;
    });
  }

  //----------------------------------------------------------------------------
  // Update Resource
  //----------------------------------------------------------------------------

  async function updateResource(
    id: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>,
  ): Promise<string | undefined> {
    const { error } = await supabase.rpc(`update_${storeName.s}`, {
      p_id: id,
      p_lang: lang,
      [`p_${storeName.s}`]: resource,
      [`p_${storeName.s}_translation`]: translation,
    });

    if (error) return error.message;

    queryClient.invalidateQueries({ queryKey: [fetchResourceId, id] });

    return undefined;
  }

  //----------------------------------------------------------------------------
  // Use Filtered Resources Ids
  //----------------------------------------------------------------------------

  function useFilteredResourceIds(campaignId: string): string[] {
    const filters = filtersStore.useValue();
    const resourceIds = useResourceIds(campaignId);
    const filteredResourceIds = filteredResourceIdsStore.useValue(
      campaignId,
      emptyResourceIds,
    );

    useLayoutEffect(() => {
      const filtersName = normalizeString(filters.name);
      filteredResourceIdsStore.set(
        campaignId,
        emptyResourceIds,
        resourceIds.filter((id) => {
          const resource = resourcesStore.get(id, defaultResource);
          return Object.values(resource.name)
            .filter((name) => name)
            .some((name) => normalizeString(name!).includes(filtersName));
        }),
      );
    }, [campaignId, filters.name, resourceIds]);

    return filteredResourceIds;
  }

  //----------------------------------------------------------------------------
  // Use Filters
  //----------------------------------------------------------------------------

  function useFilters(): [F, (partial: Partial<F>) => void] {
    const [filters, setFilters] = filtersStore.use();

    const setPartialFilters = useCallback(
      (partial: Partial<F>) => setFilters((prev) => ({ ...prev, ...partial })),
      [setFilters],
    );

    return [filters, setPartialFilters];
  }

  //----------------------------------------------------------------------------
  // Use Localized Resource
  //----------------------------------------------------------------------------

  function useLocalizedResource(resourceId: string): L | undefined {
    const resource = useResource(resourceId);
    const localizeResource = useLocalizeResource();

    return useMemo(() => {
      return resource ? localizeResource(resource) : undefined;
    }, [localizeResource, resource]);
  }

  //----------------------------------------------------------------------------
  // Use Resource
  //----------------------------------------------------------------------------

  function useResource(resourceId: string): R | undefined {
    const { data: resource } = useQuery<R | undefined>({
      queryFn: () => fetchResource(resourceId),
      queryKey: [fetchResourceId, resourceId],
    });

    return resource;
  }

  //----------------------------------------------------------------------------
  // Use Resources Ids
  //----------------------------------------------------------------------------

  function useResourceIds(campaignId: string): string[] {
    const [lang] = useI18nLang();
    const [modules] = useResourcesModulesFilter(campaignId);
    const { name: _, ...filters } = filtersStore.useValue();

    const { data: resources } = useQuery<R[]>({
      queryFn: () => fetchResources(campaignId, modules, filters, lang),
      queryKey: [fetchResourcesId, campaignId, modules, filters, lang],
    });

    useLayoutEffect(() => {
      if (resources) {
        resourceIdsStore.set(
          campaignId,
          emptyResourceIds,
          resources.map(({ id }) => id),
        );
        resources.forEach((resource) => {
          resourcesStore.set(resource.id, defaultResource, resource);
        });
      }
    }, [campaignId, resources]);

    return resourceIdsStore.useValue(campaignId, emptyResourceIds);
  }

  //----------------------------------------------------------------------------
  // Use Resource Selection
  //----------------------------------------------------------------------------

  function useResourceSelection(
    resourceId: string,
  ): [boolean, StateSetter<boolean>] {
    return resourceSelectionStore.use(resourceId, false);
  }

  //----------------------------------------------------------------------------
  // Use Resource Selection Count
  //----------------------------------------------------------------------------

  function useResourceSelectionCount(campaignId: string): number {
    return resourceSelectionCountStore.useValue(campaignId, 0);
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: storeId,
    name: storeName,

    defaultResource,

    createResource,
    deleteResources,
    deselectAllResources,
    deselectResource,
    getSelectedResources,
    selectAllResources,
    selectResource,
    toggleResourceSelection,
    updateResource,
    useFilteredResourceIds,
    useFilters,
    useLocalizedResource,
    useResource,
    useResourceIds,
    useResourceSelection,
    useResourceSelectionCount,
  };
}
