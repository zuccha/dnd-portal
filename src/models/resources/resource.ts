import z from "zod";
import { i18nNumberSchema } from "~/i18n/i18n-number";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { campaignRoleSchema } from "../types/campaign-role";

//------------------------------------------------------------------------------
// Resource
//------------------------------------------------------------------------------

export const resourceSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),
  campaign_name: z.string(),

  visibility: campaignRoleSchema,

  name: i18nStringSchema,
  page: i18nNumberSchema,
});

export type Resource = z.infer<typeof resourceSchema>;
