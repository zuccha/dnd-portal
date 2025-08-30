import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { type ZodType, z } from "zod";
import { useI18nLang } from "../i18n/i18n-lang";
import { createLocalStore } from "../store/local-store";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Create Resource
//------------------------------------------------------------------------------

export function createResource<
  Resource,
  Filters extends { order_by: string; order_dir: "asc" | "desc" }
>(
  id: string,
  resourceSchema: ZodType<Resource>,
  filtersSchema: ZodType<Filters>
) {
  //----------------------------------------------------------------------------
  // Use Filters
  //----------------------------------------------------------------------------

  const filtersStore = createLocalStore(
    `resources[${id}].filters`,
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
    `resources[${id}].filters.name`,
    "",
    z.string().parse
  );

  const useNameFilter = nameFilterStore.use;

  //----------------------------------------------------------------------------
  // Fetch Campaign Resources
  //----------------------------------------------------------------------------

  async function fetchCampaignResources(
    campaignId: string,
    { order_by, order_dir, ...filters }: Filters,
    lang: string
  ): Promise<Resource[]> {
    const { data } = await supabase.rpc(`fetch_${id}`, {
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
  // Use Campaign Resources
  //----------------------------------------------------------------------------

  function useCampaignResources(campaignId: string) {
    const [lang] = useI18nLang();
    const [filters] = useFilters();

    const fetchCampaignsResources = useCallback(
      () => fetchCampaignResources(campaignId, filters, lang),
      [campaignId, filters, lang]
    );

    return useQuery<Resource[]>({
      queryFn: fetchCampaignsResources,
      queryKey: [`resources[${id}]`, campaignId, filters, lang],
    });
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    useCampaignResources,
    useFilters,
    useNameFilter,
  };
}
