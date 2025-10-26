import z from "zod";
import { campaignRoleSchema } from "./campaign-role";

//------------------------------------------------------------------------------
// DB Resource
//------------------------------------------------------------------------------

export const dbResourceSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),

  visibility: campaignRoleSchema,
});

export type DBResource = z.infer<typeof dbResourceSchema>;

//------------------------------------------------------------------------------
// DB Resource Translation
//------------------------------------------------------------------------------

export const dbResourceTranslationSchema = z.object({
  lang: z.string(),

  name: z.string(),
  page: z.string().nullish(),
});

export type DBResourceTranslation = z.infer<typeof dbResourceTranslationSchema>;
