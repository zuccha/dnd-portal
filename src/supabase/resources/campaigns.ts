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
    queryKey: ["campaigns"],

    gcTime: 30 * 24 * 60 * 60 * 1000,
    staleTime: Infinity,
  });
}

//------------------------------------------------------------------------------
// Use Selected User Campaign
//------------------------------------------------------------------------------

export const { use: useSelectedUserCampaignId } = createMemoryStore<
  string | undefined
>(undefined);
