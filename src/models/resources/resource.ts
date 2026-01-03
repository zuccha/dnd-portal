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
  page: i18nNumberSchema.nullish(),
});

export type Resource = z.infer<typeof resourceSchema>;

//------------------------------------------------------------------------------
// Resource Translation Fields
//------------------------------------------------------------------------------

export type TranslationFields<R extends Resource> = KeysOfType<
  R,
  I18nNumber | I18nString | undefined | null
>;

export const resourceTranslationFields: TranslationFields<Resource>[] = [
  "name",
  "page",
];

//------------------------------------------------------------------------------
// Resource Option
//------------------------------------------------------------------------------

export const resourceOptionSchema = z.object({
  id: z.uuid(),
  name: i18nStringSchema,
});

export type ResourceOption = z.infer<typeof resourceOptionSchema>;

//------------------------------------------------------------------------------
// Localized Resource Option
//------------------------------------------------------------------------------

export const localizedResourceOptionSchema = resourceOptionSchema.extend({
  label: z.string(),
  value: z.uuid(),
});

export type LocalizedResourceOption = z.infer<
  typeof localizedResourceOptionSchema
>;
