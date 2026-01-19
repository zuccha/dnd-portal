import z from "zod";
import { createTypeTranslationHooks } from "./_base";

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
