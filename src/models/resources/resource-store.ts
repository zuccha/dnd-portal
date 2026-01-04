import { useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStoreSet } from "~/store/set/memory-store-set";
import supabase, { queryClient } from "~/supabase";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";
import type { ResourceKind } from "../types/resource-kind";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import {
  type LocalizedResourceOption,
  type Resource,
  type TranslationFields,
  defaultLocalizedResourceOption,
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
  const fetchResourceId = `${storeId}.fetch_resource`;
  const fetchResourceOptionsId = `${storeId}.fetch_resource_options`;
  const fetchResourcesId = `${storeId}.fetch_resources`;

  const emptyResourceIds: string[] = [];
  const emptyLocalizedResourceOptions: LocalizedResourceOption[] = [];
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
  // Resource Options Store
  //----------------------------------------------------------------------------

  // resource id -> resource option
  const resourceOptionsStore = createMemoryStoreSet<
    string,
    LocalizedResourceOption
  >(`${storeId}.resource_options`);

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
    queryClient.invalidateQueries({ queryKey: [fetchResourceOptionsId] });
    for (const resourceId of resourceIds) {
      const queryKey = [fetchResourceId, resourceId];
      queryClient.invalidateQueries({ queryKey });
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
    try {
      const p_id = resourceId;
      const { data } = await supabase.rpc(`fetch_${storeName.s}`, { p_id });
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
    lang: string,
  ): Promise<LocalizedResourceOption[]> {
    try {
      if (!campaignId) return emptyLocalizedResourceOptions;
      const p_campaign_id = campaignId;
      const p_resource_kinds = kinds;
      const params = { p_campaign_id, p_resource_kinds };
      const { data } = await supabase.rpc(`fetch_resource_options`, params);
      const resourceOptions = z.array(resourceOptionSchema).parse(data);
      return resourceOptions
        .map((option) => {
          const label = translate(option.name, lang);
          const localizedOption = { ...option, label, value: option.id };
          resourceOptionsStore.set(option.id, localizedOption, localizedOption);
          return localizedOption;
        })
        .sort(compareObjects("label"));
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
    try {
      const p_campaign_id = campaignId;
      const p_filters = { ...filters, campaigns: modules };
      const p_langs = [lang];
      const p_order = { p_order_by: order_by, p_order_dir: order_dir };
      const params = { p_campaign_id, p_filters, p_langs, ...p_order };
      const { data } = await supabase.rpc(`fetch_${storeName.p}`, params);
      const resources = z.array(resourceSchema).parse(data);
      for (const resource of resources) {
        queryClient.setQueryData([fetchResourceId, resource.id], resource);
        setResource(resource);
      }
      const resourceIds = resources.map(({ id }) => id);
      resourceIdsStore.set(campaignId, emptyResourceIds, resourceIds);
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
  // Use Localize Resource Name
  //----------------------------------------------------------------------------

  function useLocalizeResourceName(
    campaignId: string,
  ): (resourceId: string) => string {
    useLocalizedResourceOptions(campaignId);
    const [lang] = useI18nLang();

    return useCallback(
      (resourceId: string) => {
        const name = resourceOptionsStore.get(
          resourceId,
          defaultLocalizedResourceOption,
        ).name;
        return translate(name, lang);
      },
      [lang],
    );
  }

  //----------------------------------------------------------------------------
  // Use Localized Resource
  //----------------------------------------------------------------------------

  function useLocalizedResource(resourceId: string): L | undefined {
    const resource = useResource(resourceId);
    const localizeResource = useLocalizeResource(resource?.id ?? "");

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

    const { data: options } = useQuery<LocalizedResourceOption[]>({
      queryFn: async () => fetchResourceOptions(campaignId, lang),
      queryKey: [fetchResourceOptionsId, campaignId, lang],
    });

    return options ?? emptyLocalizedResourceOptions;
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

    useQuery<R[]>({
      queryFn: () => fetchResources(campaignId, modules, filters, lang),
      queryKey: [fetchResourcesId, campaignId, modules, filters, lang],
    });

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
    useLocalizeResourceName,
    useLocalizedResource,
    useLocalizedResourceOptions,
    useResource,
    useResourceIds,
    useResourceSelection,
    useSelectedFilteredResourceIds,
  };
}
