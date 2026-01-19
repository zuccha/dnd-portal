import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Language Scope
//------------------------------------------------------------------------------

export const languageScopeSchema = z.enum(["all", "specific", "none"]);

export const languageScopes = languageScopeSchema.options;

export type LanguageScope = z.infer<typeof languageScopeSchema>;

//------------------------------------------------------------------------------
// Language Scope Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useLanguageScopeOptions,
  useTranslate: useTranslateLanguageScope,
  useTranslations: useLanguageScopeTranslations,
} = createTypeTranslationHooks(languageScopes, {
  all: { en: "All", it: "Tutte" },
  none: { en: "None", it: "Nessuna" },
  specific: { en: "Specific", it: "Specifiche" },
});
