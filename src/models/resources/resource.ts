import z from "zod";
import { type I18nNumber, i18nNumberSchema } from "~/i18n/i18n-number";
import { type I18nString, i18nStringSchema } from "~/i18n/i18n-string";
import type { KeysOfType } from "~/types";
import { resourceVisibilitySchema } from "../types/resource-visibility";

//------------------------------------------------------------------------------
// Resource
//------------------------------------------------------------------------------

export const resourceSchema = z.object({
  id: z.uuid(),

  source_code: z.string(),
  source_id: z.string(),

  image_url: z.string().nullish(),
  visibility: resourceVisibilitySchema,

  name: i18nStringSchema,
  name_short: i18nStringSchema,
  page: i18nNumberSchema.nullish(),
});

export type Resource = z.infer<typeof resourceSchema>;

//------------------------------------------------------------------------------
// Default Resource
//------------------------------------------------------------------------------

export const defaultResource: Resource = {
  id: "",
  image_url: undefined,
  name: {},
  name_short: {},
  page: {},
  source_code: "",
  source_id: "",
  visibility: "private",
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
  "name_short",
  "page",
];

//------------------------------------------------------------------------------
// Resource Lookup
//------------------------------------------------------------------------------

export const resourceLookupSchema = z.object({
  id: z.uuid(),
  name: i18nStringSchema,
  name_short: i18nStringSchema,
});

export type ResourceLookup = z.infer<typeof resourceLookupSchema>;

export const defaultResourceLookup: ResourceLookup = {
  id: "",
  name: {},
  name_short: {},
};

//------------------------------------------------------------------------------
// Resource Option
//------------------------------------------------------------------------------

export const localizedResourceOptionSchema = z.object({
  label: z.string(),
  name: i18nStringSchema,
  name_short: i18nStringSchema,
  value: z.uuid(),
});

export type ResourceOption = z.infer<typeof localizedResourceOptionSchema>;

export const defaultResourceOption: ResourceOption = {
  label: "",
  name: {},
  name_short: {},
  value: "",
};
