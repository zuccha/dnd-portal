import { useQuery } from "@tanstack/react-query";
import { z } from "zod/v4";
import { createMemoryStore } from "../../store/memory-store";
import supabase from "../supabase";

//------------------------------------------------------------------------------
// Campaign
//------------------------------------------------------------------------------

export const campaignSchema = z.object({
  core: z.boolean(),
  id: z.string(),
  name: z.string(),
});

export type Campaign = z.infer<typeof campaignSchema>;

//------------------------------------------------------------------------------
// Fetch Core Campaigns
//------------------------------------------------------------------------------

export async function fetchCoreCampaigns(): Promise<Campaign[]> {
  const { data } = await supabase.from("campaigns").select().eq("core", true);
  return z.array(campaignSchema).parse(data);
}

//------------------------------------------------------------------------------
// Use Core Campaigns
//------------------------------------------------------------------------------

export function useCoreCampaigns() {
  return useQuery<Campaign[]>({
    queryFn: fetchCoreCampaigns,
    queryKey: ["campaigns/core"],
  });
}

//------------------------------------------------------------------------------
// Fetch User Campaigns
//------------------------------------------------------------------------------

export async function fetchUserCampaigns(): Promise<Campaign[]> {
  const { data } = await supabase.from("campaigns").select().eq("core", false);
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
// Use Selected User Campaign
//------------------------------------------------------------------------------

export const { use: useSelectedUserCampaignId } = createMemoryStore<
  string | undefined
>(undefined);
