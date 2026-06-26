import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Modifier
//------------------------------------------------------------------------------

export const modifierSchema = resourceSchema.extend({
  applies_to: i18nStringSchema,
  composite_name: i18nStringSchema,
});

export type Modifier = z.infer<typeof modifierSchema>;

//------------------------------------------------------------------------------
// Default Modifier
//------------------------------------------------------------------------------

export const defaultModifier: Modifier = {
  ...defaultResource,
  applies_to: {},
  composite_name: { en: "{1}", it: "{1}" },
};

//------------------------------------------------------------------------------
// Modifier Translation Fields
//------------------------------------------------------------------------------

export const modifierTranslationFields: TranslationFields<Modifier>[] = [
  ...resourceTranslationFields,
  "applies_to",
  "composite_name",
];
