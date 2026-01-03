import { useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { I18nNumber } from "~/i18n/i18n-number";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import supabase, { queryClient } from "~/supabase";
import type { KeysOfType } from "~/types";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import {
  type LocalizedResourceOption,
  type Resource,
  type ResourceOption,
  resourceOptionSchema,
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
    resourceSchema,
    orderOptions,
    translationFields,
    useLocalizeResource,
  }: {
    defaultFilters: F;
    defaultResource: R;
    filtersSchema: ZodType<F>;
    orderOptions: { label: I18nString; value: string }[];
    resourceSchema: ZodType<R>;
    translationFields: KeysOfType<R, I18nString | I18nNumber>[];
    useLocalizeResource: () => (resource: R) => L;
  },
) {
  const storeId = `resources[${storeName.p}]`;
  const fetchResourceId = `${storeId}.fetch_resource`;
  const fetchResourceOptionsId = `${storeId}.fetch_resource_options`;
  const fetchResourcesId = `${storeId}.fetch_resources`;

  const emptyResourceIds: string[] = [];
  const emptyLocalizedResourceOptions: ResourceOption[] = [];
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
    queryClient.invalidateQueries({ queryKey: [fetchResourceOptionsId] });

    return undefined;
  }

  //----------------------------------------------------------------------------
  // Delete Resources
  //----------------------------------------------------------------------------

  async function deleteResources(
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
      queryClient.invalidateQueries({ queryKey: [fetchResourceOptionsId] });
      deselectResource(resourceId);
      resourcesStore.clear(resourceId);
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
  }

  //----------------------------------------------------------------------------
  // Deselect Resource
  //----------------------------------------------------------------------------

  function deselectResource(resourceId: string): void {
    resourceSelectionStore.set(resourceId, false, false);
  }

  //----------------------------------------------------------------------------
  // Fetch Resource
  //----------------------------------------------------------------------------

  async function fetchResource(resourceId: string): Promise<R | undefined> {
    const { data } = await supabase.rpc(`fetch_${storeName.s}`, {
      p_id: resourceId,
    });
    try {
      const resource = resourceSchema.optional().parse(data);
      if (resource) setResource(resource);
      return resource;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  //----------------------------------------------------------------------------
  // Fetch Resource Options
  //----------------------------------------------------------------------------

  async function fetchResourceOptions(
    campaignId: string,
  ): Promise<ResourceOption[]> {
    const { data } = await supabase.rpc(`fetch_resource_options`, {
      p_campaign_id: campaignId,
      p_resource_kind: storeName.s,
    });
    try {
      return z.array(resourceOptionSchema).parse(data);
    } catch (e) {
      console.error(e);
      return [];
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
      for (const resource of resources) {
        queryClient.setQueryData([fetchResourceId, resource.id], resource);
        setResource(resource);
      }
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
  }

  //----------------------------------------------------------------------------
  // Select Resource
  //----------------------------------------------------------------------------

  function selectResource(resourceId: string): void {
    resourceSelectionStore.set(resourceId, false, true);
  }

  //----------------------------------------------------------------------------
  // Set Resource
  //----------------------------------------------------------------------------

  function setResource(resource: R): void {
    resourcesStore.set(resource.id, defaultResource, (prev) => {
      const merged = { ...prev, ...resource };
      for (const translationField of translationFields) {
        merged[translationField] = {
          ...prev[translationField],
          ...resource[translationField],
        };
      }
      return merged;
    });
  }

  //----------------------------------------------------------------------------
  // Set Resource Selection
  //----------------------------------------------------------------------------

  function setResourceSelection(resourceId: string, selected: boolean): void {
    resourceSelectionStore.set(resourceId, false, selected);
  }

  //----------------------------------------------------------------------------
  // Toggle Resource Selection
  //----------------------------------------------------------------------------

  function toggleResourceSelection(resourceId: string): void {
    resourceSelectionStore.set(resourceId, false, (prev) => !prev);
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
    queryClient.invalidateQueries({ queryKey: [fetchResourceOptionsId] });

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
  // Use Localized Resource Options
  //----------------------------------------------------------------------------

  function useLocalizedResourceOptions(
    campaignId: string,
  ): LocalizedResourceOption[] {
    const [lang] = useI18nLang();

    const { data: options } = useQuery<ResourceOption[]>({
      queryFn: () =>
        campaignId ?
          fetchResourceOptions(campaignId)
        : emptyLocalizedResourceOptions,
      queryKey: [fetchResourceOptionsId, campaignId],
    });

    return useMemo(() => {
      if (!options) return [];
      return options
        .map((option) => ({
          ...option,
          label: translate(option.name, lang),
          value: option.id,
        }))
        .sort(compareObjects("label"));
    }, [lang, options]);
  }

  //----------------------------------------------------------------------------
  // Use Resource
  //----------------------------------------------------------------------------

  function useResource(resourceId: string): R | undefined {
    const resource = resourcesStore.useValue(resourceId, defaultResource);

    useQuery<R | undefined>({
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
      }
    }, [campaignId, resources]);

    return resourceIdsStore.useValue(campaignId, emptyResourceIds);
  }

  //----------------------------------------------------------------------------
  // Use Resource Selection
  //----------------------------------------------------------------------------

  function useResourceSelection(resourceId: string): boolean {
    return resourceSelectionStore.useValue(resourceId, false);
  }

  //----------------------------------------------------------------------------
  // Use Selected Filtered Resources Ids
  //----------------------------------------------------------------------------

  function useSelectedFilteredResourceIds(campaignId: string): string[] {
    const filteredResourceIds = useFilteredResourceIds(campaignId);
    const [selectedFilteredResourceIds, setSelectedFilteredResourceIds] =
      useState<string[]>([]);

    useLayoutEffect(() => {
      const update = () => {
        setSelectedFilteredResourceIds(
          filteredResourceIds.filter((id) =>
            resourceSelectionStore.get(id, false),
          ),
        );
      };
      update();
      return resourceSelectionStore.subscribeAny(update);
    }, [filteredResourceIds]);

    return selectedFilteredResourceIds;
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: storeId,
    name: storeName,

    defaultResource,
    orderOptions,

    createResource,
    deleteResources,
    deselectAllResources,
    deselectResource,
    getSelectedResources,
    selectAllResources,
    selectResource,
    setResourceSelection,
    toggleResourceSelection,
    updateResource,
    useFilteredResourceIds,
    useFilters,
    useLocalizeResource,
    useLocalizedResource,
    useLocalizedResourceOptions,
    useResource,
    useResourceIds,
    useResourceSelection,
    useSelectedFilteredResourceIds,
  };
}
