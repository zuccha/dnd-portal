import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useState } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "../i18n/i18n-lang";
import { createLocalStore } from "../store/local-store";
import supabase from "../supabase";
import { createObservable } from "../utils/observable";
import { createObservableSet } from "../utils/observable-set";

//------------------------------------------------------------------------------
// Resource Store
//------------------------------------------------------------------------------

export type ResourceStore<
  Resource,
  Filters extends { order_by: string; order_dir: "asc" | "desc" }
> = {
  useFromCampaign: (campaignId: string) => UseQueryResult<Resource[], Error>;

  useFilters: () => [Filters, (partial: Partial<Filters>) => void];
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
};

//------------------------------------------------------------------------------
// Create Resource Store
//------------------------------------------------------------------------------

export function createResourceStore<
  Resource,
  Filters extends { order_by: string; order_dir: "asc" | "desc" }
>(
  storeId: string,
  resourceSchema: ZodType<Resource>,
  filtersSchema: ZodType<Filters>
): ResourceStore<Resource, Filters> {
  //----------------------------------------------------------------------------
  // Use Filters
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore(
    `resources[${storeId}].filters`,
    filtersSchema.parse({}),
    filtersSchema.parse
  );

  function useFilters(): [Filters, (partial: Partial<Filters>) => void] {
    const [filters, setFilters] = filtersStore.use();

    const updateFilter = useCallback(
      (partial: Partial<Filters>) =>
        setFilters((prev) => ({ ...prev, ...partial })),
      [setFilters]
    );

    return [filters, updateFilter];
  }

  //----------------------------------------------------------------------------
  // Use Name Filter
  //----------------------------------------------------------------------------

  const nameFilterStore = createLocalStore(
    `resources[${storeId}].filters.name`,
    "",
    z.string().parse
  );

  const useNameFilter = nameFilterStore.use;

  //----------------------------------------------------------------------------
  // Fetch From Campaign
  //----------------------------------------------------------------------------

  async function fetchFromCampaign(
    campaignId: string,
    { order_by, order_dir, ...filters }: Filters,
    lang: string
  ): Promise<Resource[]> {
    const { data } = await supabase.rpc(`fetch_${storeId}`, {
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

    return useQuery<Resource[]>({
      queryFn: fetchCampaignsResources,
      queryKey: [`resources[${storeId}]`, campaignId, filters, lang],
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
  // Return
  //----------------------------------------------------------------------------

  return {
    useFromCampaign,

    useFilters,
    useNameFilter,

    deselect,
    select,
    toggleSelected,

    isSelected,
    useIsSelected,
    useSelectionCount,
  };
}
