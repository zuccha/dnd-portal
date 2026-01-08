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
// Default Resource
//------------------------------------------------------------------------------

export const defaultResource: Resource = {
  campaign_id: "",
  campaign_name: "",
  id: "",
  name: {},
  page: {},
  visibility: "game_master",
};

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
// Resource Lookup
//------------------------------------------------------------------------------

export const resourceLookupSchema = z.object({
  id: z.uuid(),
  name: i18nStringSchema,
});

export type ResourceLookup = z.infer<typeof resourceLookupSchema>;

export const defaultResourceLookup: ResourceLookup = { id: "", name: {} };

//------------------------------------------------------------------------------
// Resource Option
//------------------------------------------------------------------------------

export const localizedResourceOptionSchema = z.object({
  label: z.string(),
  name: i18nStringSchema,
  value: z.uuid(),
});

export type ResourceOption = z.infer<typeof localizedResourceOptionSchema>;

export const defaultResourceOption: ResourceOption = {
  label: "",
  name: {},
  value: "",
};
