import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { languageRaritySchema } from "../../types/language-rarity";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Language
//------------------------------------------------------------------------------

export const languageSchema = resourceSchema.extend({
  origin: i18nStringSchema,
  rarity: languageRaritySchema,
});

export type Language = z.infer<typeof languageSchema>;

//------------------------------------------------------------------------------
// Default Language
//------------------------------------------------------------------------------

export const defaultLanguage: Language = {
  ...defaultResource,
  origin: {},
  rarity: "standard",
};

//------------------------------------------------------------------------------
// Language Translation Fields
//------------------------------------------------------------------------------

export const languageTranslationFields: TranslationFields<Language>[] = [
  ...resourceTranslationFields,
  "origin",
];
