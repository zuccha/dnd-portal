import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useState } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "../i18n/i18n-lang";
import type { I18nString } from "../i18n/i18n-string";
import { createLocalStore } from "../store/local-store";
import supabase, { queryClient } from "../supabase";
import { createObservable } from "../utils/observable";
import { createObservableSet } from "../utils/observable-set";

//------------------------------------------------------------------------------
// Resource
//------------------------------------------------------------------------------

export type Resource = { id: string; name: I18nString };
export type DBResource = { id: string };
export type DBResourceTranslation = { lang: string };
export type ResourceFilters = { order_by: string; order_dir: "asc" | "desc" };
export type LocalizedResource<R extends Resource> = { _raw: R; id: string };

//------------------------------------------------------------------------------
// Resource Store
//------------------------------------------------------------------------------

export type ResourceStore<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  F extends ResourceFilters
> = {
  id: string;

  useFromCampaign: (campaignId: string) => UseQueryResult<R[], Error>;

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
  remove: (ids: string[]) => Promise<PostgrestSingleResponse<null>>;
  update: (
    id: string,
    lang: string,
    resource: Partial<DBR>,
    translation: Partial<DBT>
  ) => Promise<PostgrestSingleResponse<null>>;
};

//------------------------------------------------------------------------------
// Create Resource Store
//------------------------------------------------------------------------------

export function createResourceStore<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  F extends ResourceFilters
>(
  name: { s: string; p: string },
  resourceSchema: ZodType<R>,
  filtersSchema: ZodType<F>
): ResourceStore<R, DBR, DBT, F> {
  //----------------------------------------------------------------------------
  // Use Filters
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore(
    `resources[${name.p}].filters`,
    filtersSchema.parse({}),
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
  // Use From Campaign
  //----------------------------------------------------------------------------

  function useFromCampaign(campaignId: string) {
    const [lang] = useI18nLang();
    const [filters] = useFilters();

    const fetchCampaignsResources = useCallback(
      () => fetchFromCampaign(campaignId, filters, lang),
      [campaignId, filters, lang]
    );

    return useQuery<R[]>({
      queryFn: fetchCampaignsResources,
      queryKey: [`resources[${name.p}]`, lang, campaignId, filters],
    });
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
      queryClient.invalidateQueries({
        queryKey: [`resources[${name.p}]`],
      });
    return response;
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
    if (!response.error)
      queryClient.invalidateQueries({
        queryKey: [`resources[${name.p}]`, lang],
      });
    return response;
  }

  //----------------------------------------------------------------------------
  // Remove
  //----------------------------------------------------------------------------

  async function remove(ids: string[]): Promise<PostgrestSingleResponse<null>> {
    const response = await supabase.from(name.p).delete().in("id", ids);
    if (!response.error)
      queryClient.invalidateQueries({ queryKey: [`resources[${name.p}]`] });
    return response;
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    id: name.p,

    useFromCampaign,

    useFilters,
    useNameFilter,

    deselect,
    select,
    toggleSelected,

    isSelected,
    useIsSelected,
    useSelectionCount,

    create,
    remove,
    update,
  };
}
