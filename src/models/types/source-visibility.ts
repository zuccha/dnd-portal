import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Source Visibility
//------------------------------------------------------------------------------

export const sourceVisibilitySchema = z.enum([
  "public",
  "private",
  "purchasable",
]);

export const sourceVisibilities = sourceVisibilitySchema.options;

export type SourceVisibility = z.infer<typeof sourceVisibilitySchema>;

//------------------------------------------------------------------------------
// Source Visibility Translation Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSourceVisibilityOptions,
  useTranslate: useTranslateSourceVisibility,
  useTranslations: useSourceVisibilityTranslations,
} = createTypeTranslationHooks(sourceVisibilities, {
  private: { en: "Private", it: "Privata" },
  public: { en: "Public", it: "Pubblica" },
  purchasable: { en: "Purchasable", it: "Acquistabile" },
});
