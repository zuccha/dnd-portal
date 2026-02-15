import z from "zod";
import { campaignRoleSchema } from "../types/campaign-role";

//------------------------------------------------------------------------------
// DB Resource
//------------------------------------------------------------------------------

export const dbResourceSchema = z.object({
  image_url: z.string().nullable(),
  visibility: campaignRoleSchema,
});

export type DBResource = z.infer<typeof dbResourceSchema>;

//------------------------------------------------------------------------------
// DB Resource Translation
//------------------------------------------------------------------------------

export const dbResourceTranslationSchema = z.object({
  name: z.string(),
  name_short: z.string(),
  page: z.number().nullable(),
});

export type DBResourceTranslation = z.infer<typeof dbResourceTranslationSchema>;
