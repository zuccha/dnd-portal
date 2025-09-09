import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import z from "zod";
import supabase from "../supabase";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Campaign Role
//------------------------------------------------------------------------------

export const campaignRoleSchema = z.enum(["game_master", "player"]);

export const campaignRoles = campaignRoleSchema.options;

export type CampaignRole = z.infer<typeof campaignRoleSchema>;

//------------------------------------------------------------------------------
// Campaign Role Translation
//------------------------------------------------------------------------------

export const campaignRoleTranslationSchema = z.object({
  campaign_role: campaignRoleSchema,
  label: z.string().default(""),
  lang: z.string().default("en"),
});

export type CampaignRoleTranslation = z.infer<
  typeof campaignRoleTranslationSchema
>;

//------------------------------------------------------------------------------
// Campaign Role Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCampaignRole,
  useTranslations: useCampaignRoleTranslations,
} = createTypeTranslationHooks(
  "campaign_role",
  campaignRoles,
  campaignRoleTranslationSchema
);

//------------------------------------------------------------------------------
// Use Campaign Role Options
//------------------------------------------------------------------------------

export function useCampaignRoleOptions() {
  const campaignRoleTranslations = useCampaignRoleTranslations();

  return useMemo(
    () =>
      campaignRoleTranslations.map(({ campaign_role, label }) => ({
        label,
        value: campaign_role,
      })),
    [campaignRoleTranslations]
  );
}

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
