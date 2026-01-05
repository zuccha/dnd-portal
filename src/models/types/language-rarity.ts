import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Language Rarity
//------------------------------------------------------------------------------

export const languageRaritySchema = z.enum(["standard", "rare", "special"]);

export const languageRarities = languageRaritySchema.options;

export type LanguageRarity = z.infer<typeof languageRaritySchema>;

//------------------------------------------------------------------------------
// Language Rarity Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useLanguageRarityOptions,
  useTranslate: useTranslateLanguageRarity,
  useTranslations: useLanguageRarityTranslations,
} = createTypeTranslationHooks(languageRarities, {
  rare: { en: "Rare", it: "Rara" },
  special: { en: "Special", it: "Speciale" },
  standard: { en: "Standard", it: "Standard" },
});
