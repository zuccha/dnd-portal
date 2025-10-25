import z from "zod";
import { i18nStringSchema } from "../i18n/i18n-string";
import { campaignRoleSchema } from "./campaign-role";

//------------------------------------------------------------------------------
// Resource
//------------------------------------------------------------------------------

export const resourceSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),
  campaign_name: z.string(),

  name: i18nStringSchema,

  visibility: campaignRoleSchema,
});

export type Resource = z.infer<typeof resourceSchema>;

//------------------------------------------------------------------------------
// Resource Filters
//------------------------------------------------------------------------------

export const resourceFiltersSchema = z.object({
  order_by: z.string(),
  order_dir: z.enum(["asc", "desc"]).default("asc"),
});

export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
