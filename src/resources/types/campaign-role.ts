import { useQuery } from "@tanstack/react-query";
import z from "zod";
import supabase from "../../supabase";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Campaign Role
//------------------------------------------------------------------------------

export const campaignRoleSchema = z.enum(["game_master", "player"]);

export const campaignRoles = campaignRoleSchema.options;

export type CampaignRole = z.infer<typeof campaignRoleSchema>;

//------------------------------------------------------------------------------
// Campaign Role Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useCampaignRoleOptions,
  useTranslate: useTranslateCampaignRole,
  useTranslations: useCampaignRoleTranslations,
} = createTypeTranslationHooks(campaignRoles, {
  game_master: { en: "Game Master", it: "Game Master" },
  player: { en: "Player", it: "Giocatore" },
});

//------------------------------------------------------------------------------
// Fetch Campaign Role
//------------------------------------------------------------------------------

export async function fetchCampaignRole(
  campaignId: string
): Promise<CampaignRole> {
  const { data } = await supabase.rpc("fetch_campaign_role", {
    p_campaign_id: campaignId,
  });
  return campaignRoleSchema.parse(data);
}

//------------------------------------------------------------------------------
// Use Campaign Role
//------------------------------------------------------------------------------

export function useCampaignRole(campaignId: string) {
  return useQuery<CampaignRole>({
    queryFn: () => fetchCampaignRole(campaignId),
    queryKey: ["campaign-role", campaignId],
  });
}

//------------------------------------------------------------------------------
// Use Is GM
//------------------------------------------------------------------------------

export function useIsGM(campaignId: string): boolean {
  const { data: campaignRole } = useCampaignRole(campaignId);
  return campaignRole === "game_master";
}
