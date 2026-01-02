import z from "zod";
import { type I18nNumber, i18nNumberSchema } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
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

//------------------------------------------------------------------------------
// Resource Translation Fields
//------------------------------------------------------------------------------

export const resourceTranslationFields: KeysOfType<
  Resource,
  I18nNumber | I18nString
>[] = ["name", "page"];
