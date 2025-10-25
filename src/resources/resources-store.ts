import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useState } from "react";
import { type ZodType, z } from "zod";
import { createUseShared } from "../hooks/use-shared";
import { useI18nLang } from "../i18n/i18n-lang";
import { createLocalStore } from "../store/local-store";
import supabase, { queryClient } from "../supabase";
import { createObservable } from "../utils/observable";
import { createObservableSet } from "../utils/observable-set";
import type { DBResource, DBResourceTranslation } from "./db-resource";
import type { LocalizedResource } from "./localized-resource";
import type { Resource, ResourceFilters } from "./resource";

//------------------------------------------------------------------------------
// Resources Store
//------------------------------------------------------------------------------

export type ResourcesStore<
  R extends Resource,
  F extends ResourceFilters,
  L extends LocalizedResource<R>,
  DBR extends DBResource,
  DBT extends DBResourceTranslation
> = {
  id: string;

  use: (id: string) => [R | undefined, boolean, Error | undefined];
  useFromCampaign: (campaignId: string) => [R[], boolean, Error | undefined];
  useLocalizedFromCampaign: (
    campaignId: string
  ) => [L[], boolean, Error | undefined];
  useSelectedLocalizedFromCampaign: (
    campaignId: string
  ) => [L[], boolean, Error | undefined];

  useFilters: () => [F, (partial: Partial<F>) => void];
  useNameFilter: () => [string, (name: string) => void];

  deselect: (resourceId: string) => void;
  select: (resourceId: string) => void;
  toggleSelected: (resourceId: string) => void;

  isSelected: (resourceId: string) => void;
  useIsSelected: (
    resourceId: string
  ) => [
    boolean,
    { deselect: () => void; select: () => void; toggle: () => void }
  ];
  useSelectionCount: () => number;

  create: (
    campaignId: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>
  ) => Promise<PostgrestSingleResponse<null>>;
  fetch: (id: string) => Promise<R | undefined>;
  fetchFromCampaign: (
    campaignId: string,
    { order_by, order_dir, ...filters }: F,
    lang: string
  ) => Promise<R[]>;
  remove: (ids: string[]) => Promise<PostgrestSingleResponse<null>>;
  update: (
    id: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>
  ) => Promise<PostgrestSingleResponse<null>>;
};

//------------------------------------------------------------------------------
// Create Resources Store
//------------------------------------------------------------------------------

export function createResourcesStore<
  R extends Resource,
  F extends ResourceFilters,
  L extends LocalizedResource<R>,
  DBR extends DBResource,
  DBT extends DBResourceTranslation
>(
  name: { s: string; p: string },
  resourceSchema: ZodType<R>,
  filtersSchema: ZodType<F>,
  defaultFilters: F,
  useLocalizeResource: () => (resource: R) => L
): ResourcesStore<R, F, L, DBR, DBT> {
  //----------------------------------------------------------------------------
  // Use Filters
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore(
    `resources[${name.p}].filters`,
    defaultFilters,
    filtersSchema.parse
  );

  function useFilters(): [F, (partial: Partial<F>) => void] {
    const [filters, setFilters] = filtersStore.use();

    const updateFilter = useCallback(
      (partial: Partial<F>) => setFilters((prev) => ({ ...prev, ...partial })),
      [setFilters]
    );

    return [filters, updateFilter];
  }

  //----------------------------------------------------------------------------
  // Use Name Filter
  //----------------------------------------------------------------------------

  const nameFilterStore = createLocalStore(
    `resources[${name.p}].filters.name`,
    "",
    z.string().parse
  );

  const useNameFilter = nameFilterStore.use;

  //----------------------------------------------------------------------------
  // Create
  //----------------------------------------------------------------------------

  async function create(
    campaignId: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>
  ): Promise<PostgrestSingleResponse<null>> {
    const response = await supabase.rpc(`create_${name.s}`, {
      p_campaign_id: campaignId,
      p_lang: lang,
      [`p_${name.s}`]: resource,
      [`p_${name.s}_translation`]: translation,
    });
    if (!response.error)
      queryClient.invalidateQueries({ queryKey: [`resources`, name.p] });
    return response;
  }

  //----------------------------------------------------------------------------
  // Fetch
  //----------------------------------------------------------------------------

  async function fetch(id: string): Promise<R | undefined> {
    const { data } = await supabase.rpc(`fetch_${name.s}`, { p_id: id });
    try {
      return resourceSchema.parse(data);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  //----------------------------------------------------------------------------
  // Fetch From Campaign
  //----------------------------------------------------------------------------

  async function fetchFromCampaign(
    campaignId: string,
    { order_by, order_dir, ...filters }: F,
    lang: string
  ): Promise<R[]> {
    const { data } = await supabase.rpc(`fetch_${name.p}`, {
      p_campaign_id: campaignId,
      p_filters: filters,
      p_langs: [lang],
      p_order_by: order_by,
      p_order_dir: order_dir,
    });
    try {
      return z.array(resourceSchema).parse(data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  //----------------------------------------------------------------------------
  // Update
  //----------------------------------------------------------------------------

  async function update(
    id: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>
  ): Promise<PostgrestSingleResponse<null>> {
    const response = await supabase.rpc(`update_${name.s}`, {
      p_id: id,
      p_lang: lang,
      [`p_${name.s}`]: resource,
      [`p_${name.s}_translation`]: translation,
    });
    if (!response.error) {
      queryClient.invalidateQueries({ queryKey: [`resources`, name.p, lang] });
      queryClient.invalidateQueries({ queryKey: [`resource`, name.s, id] });
    }
    return response;
  }

  //----------------------------------------------------------------------------
  // Remove
  //----------------------------------------------------------------------------

  async function remove(ids: string[]): Promise<PostgrestSingleResponse<null>> {
    const response = await supabase.from(name.p).delete().in("id", ids);
    if (!response.error) {
      queryClient.invalidateQueries({ queryKey: [`resources`, name.p] });
      for (const id of ids)
        queryClient.invalidateQueries({ queryKey: [`resource`, name.s, id] });
    }
    return response;
  }

  //----------------------------------------------------------------------------
  // Use
  //----------------------------------------------------------------------------

  function use(id: string): [R | undefined, boolean, Error | undefined] {
    const { data, isPending, error } = useQuery<R | undefined>({
      queryFn: () => fetch(id),
      queryKey: [`resource`, name.s, id],
    });
    return [data, isPending, error ?? undefined];
  }

  //----------------------------------------------------------------------------
  // Use From Campaign
  //----------------------------------------------------------------------------

  const useSharedResources = createUseShared<R[]>([], [undefined, undefined]);

  function useFromCampaign(
    campaignId: string
  ): [R[], boolean, Error | undefined] {
    const [lang] = useI18nLang();
    const [filters] = useFilters();
    const [nameFilter] = useNameFilter();

    const fetchCampaignsResources = useCallback(
      () => fetchFromCampaign(campaignId, filters, lang),
      [campaignId, filters, lang]
    );

    const { data, isPending, error } = useQuery<R[]>({
      queryFn: fetchCampaignsResources,
      queryKey: [`resources`, name.p, lang, campaignId, filters],
    });

    const resources = useSharedResources(() => {
      const trimmedNameFilter = nameFilter.trim().toLowerCase();
      return data
        ? data.filter((resource) => {
            const names = Object.values(resource.name);
            return names.some((name) =>
              name?.trim().toLowerCase().includes(trimmedNameFilter)
            );
          })
        : [];
    }, [data, nameFilter]);

    return [resources, isPending, error ?? undefined];
  }

  //----------------------------------------------------------------------------
  // Selection
  //----------------------------------------------------------------------------

  const selection = new Set<string>();

  const { notify: notifySelectionCount, subscribe: subscribeSelectionCount } =
    createObservable<number>();

  const { notify: notifySelected, subscribe: subscribeSelected } =
    createObservableSet<boolean>();

  function isSelected(resourceId: string) {
    return selection.has(resourceId);
  }

  function select(resourceId: string) {
    selection.add(resourceId);
    notifySelected(resourceId, true);
    notifySelectionCount(selection.size);
  }

  function deselect(resourceId: string) {
    selection.delete(resourceId);
    notifySelected(resourceId, false);
    notifySelectionCount(selection.size);
  }

  function toggleSelected(resourceId: string) {
    if (selection.has(resourceId)) deselect(resourceId);
    else select(resourceId);
  }

  function useSelectionCount() {
    const [count, setCount] = useState(selection.size);
    useLayoutEffect(() => subscribeSelectionCount(setCount), []);
    return count;
  }

  function useIsSelected(
    resourceId: string
  ): [
    boolean,
    { deselect: () => void; select: () => void; toggle: () => void }
  ] {
    const [selected, setSelected] = useState(selection.has(resourceId));

    useLayoutEffect(
      () => subscribeSelected(resourceId, setSelected),
      [resourceId]
    );

    return [
      selected,
      {
        deselect: useCallback(() => deselect(resourceId), [resourceId]),
        select: useCallback(() => select(resourceId), [resourceId]),
        toggle: useCallback(() => toggleSelected(resourceId), [resourceId]),
      },
    ];
  }

  //----------------------------------------------------------------------------
  // Use Localized From Campaign
  //----------------------------------------------------------------------------

  const useSharedLocalizedResources = createUseShared<L[]>([], []);

  function useLocalizedFromCampaign(
    campaignId: string
  ): [L[], boolean, Error | undefined] {
    const [resources, isPending, error] = useFromCampaign(campaignId);
    const localize = useLocalizeResource();

    const localizedResources = useSharedLocalizedResources(() => {
      return resources.map(localize);
    }, [localize, resources]);

    return [localizedResources, isPending, error ?? undefined];
  }

  //----------------------------------------------------------------------------
  // Use Selected Localized From Campaign
  //----------------------------------------------------------------------------

  const useSharedSelectedLocalizedResources = createUseShared<L[]>([], []);

  function useSelectedLocalizedFromCampaign(
    campaignId: string
  ): [L[], boolean, Error | undefined] {
    const [resources, pending, error] = useLocalizedFromCampaign(campaignId);
    const selectionCount = useSelectionCount();

    const selectedLocalizedResources =
      useSharedSelectedLocalizedResources(() => {
        return resources.filter(({ id }) => isSelected(id));
      }, [resources, selectionCount]);

    return [selectedLocalizedResources, pending, error];
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: name.p,

    use,
    useFromCampaign,
    useLocalizedFromCampaign,
    useSelectedLocalizedFromCampaign,

    useFilters,
    useNameFilter,

    deselect,
    select,
    toggleSelected,

    isSelected,
    useIsSelected,
    useSelectionCount,

    create,
    fetch,
    fetchFromCampaign,
    remove,
    update,
  };
}
