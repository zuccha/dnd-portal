import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import supabase from "~/supabase";

//------------------------------------------------------------------------------
// Campaign
//------------------------------------------------------------------------------

export const campaignSchema = z.object({
  id: z.uuid(),
  name: z.string(),

  modules: z.array(z.object({ id: z.uuid(), name: z.string() })).default([]),
});

export type Campaign = z.infer<typeof campaignSchema>;

//------------------------------------------------------------------------------
// Fetch Campaigns
//------------------------------------------------------------------------------

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data } = await supabase.rpc("fetch_campaigns");
  return z.array(campaignSchema).parse(data);
}

//------------------------------------------------------------------------------
// Fetch Created Modules
//------------------------------------------------------------------------------

export async function fetchCreatedModules(): Promise<Campaign[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("campaigns")
    .select()
    .eq("is_module", true)
    .eq("creator_id", user?.id);
  return z.array(campaignSchema).parse(data);
}

//------------------------------------------------------------------------------
// Fetch Owned Modules
//------------------------------------------------------------------------------

export async function fetchOwnedModules(): Promise<Campaign[]> {
  const { data } = await supabase
    .from("campaigns")
    .select()
    .eq("is_module", true);
  return z.array(campaignSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use Campaigns
//------------------------------------------------------------------------------

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryFn: fetchCampaigns,
    queryKey: ["campaigns/campaigns"],
  });
}

//------------------------------------------------------------------------------
// Use Created Modules
//------------------------------------------------------------------------------

export function useCreatedModules() {
  return useQuery<Campaign[]>({
    queryFn: fetchCreatedModules,
    queryKey: ["campaigns/modules/created"],
  });
}

//------------------------------------------------------------------------------
// Use Owned Modules
//------------------------------------------------------------------------------

export function useOwnedModules() {
  return useQuery<Campaign[]>({
    queryFn: fetchOwnedModules,
    queryKey: ["campaigns/modules/owned"],
  });
}

//------------------------------------------------------------------------------
// Use Campaigns And Created Modules
//------------------------------------------------------------------------------

export function useCampaignsAndCreatedModules() {
  const { data: modules = [] } = useCreatedModules();
  const { data: campaigns = [] } = useCampaigns();

  const all = useMemo(() => [...campaigns, ...modules], [campaigns, modules]);

  return { all, campaigns, modules };
}

//------------------------------------------------------------------------------
// Use Selected Campaign Id
//------------------------------------------------------------------------------

export const useSelectedCampaignId = createLocalStore<string | undefined>(
  "campaigns.selected_id",
  undefined,
  z.string().parse,
).use;

//------------------------------------------------------------------------------
// Use Selected Campaign
//------------------------------------------------------------------------------

export function useSelectedCampaign() {
  const [id] = useSelectedCampaignId();
  const { all } = useCampaignsAndCreatedModules();
  return all.find((campaign) => campaign.id === id);
}

//------------------------------------------------------------------------------
// Fetch Can Edit Campaign
//------------------------------------------------------------------------------

export async function fetchCanEditCampaign(campaignId: string) {
  const { data } = await supabase.rpc("can_edit_campaign_resource", {
    p_campaign_id: campaignId,
  });
  return z.boolean().parse(data);
}

//------------------------------------------------------------------------------
// Use Can Edit Campaign
//------------------------------------------------------------------------------

export function useCanEditCampaign(campaignId: string): boolean {
  const { data: canEditCampaign } = useQuery<boolean>({
    queryFn: () => fetchCanEditCampaign(campaignId),
    queryKey: ["campaign/can-edit", campaignId],
  });
  return !!canEditCampaign;
}
