import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import supabase from "~/supabase";

//------------------------------------------------------------------------------
// Campaign
//------------------------------------------------------------------------------

export const campaignSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type Campaign = z.infer<typeof campaignSchema>;

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
// Use Owned Modules
//------------------------------------------------------------------------------

export function useOwnedModules() {
  return useQuery<Campaign[]>({
    queryFn: fetchOwnedModules,
    queryKey: ["campaigns/modules"],
  });
}

//------------------------------------------------------------------------------
// Fetch User Campaigns
//------------------------------------------------------------------------------

export async function fetchUserCampaigns(): Promise<Campaign[]> {
  const { data } = await supabase
    .from("campaigns")
    .select()
    .eq("is_module", false);
  return z.array(campaignSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use User Campaigns
//------------------------------------------------------------------------------

export function useUserCampaigns() {
  return useQuery<Campaign[]>({
    queryFn: fetchUserCampaigns,
    queryKey: ["campaigns/user"],
  });
}

//------------------------------------------------------------------------------
// Use Selected Campaign
//------------------------------------------------------------------------------

export const useSelectedCampaignId = createLocalStore<string | undefined>(
  "campaigns.selected_id",
  undefined,
  z.string().parse,
).use;

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
