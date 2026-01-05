import { useCallback } from "react";
import z from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import { useTranslateLanguageRarity } from "../../types/language-rarity";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Language, languageSchema } from "./language";

//------------------------------------------------------------------------------
// Localized Language
//------------------------------------------------------------------------------

export const localizedLanguageSchema = localizedResourceSchema(
  languageSchema,
).extend({
  origin: z.string(),
  rarity: z.string(),
});

export type LocalizedLanguage = z.infer<typeof localizedLanguageSchema>;

//------------------------------------------------------------------------------
// Use Localized Language
//------------------------------------------------------------------------------

export function useLocalizeLanguage(): (
  language: Language,
) => LocalizedLanguage {
  const localizeResource = useLocalizeResource<Language>();
  const [lang] = useI18nLang();

  const translateLanguageRarity = useTranslateLanguageRarity(lang);

  return useCallback(
    (language: Language): LocalizedLanguage => {
      return {
        ...localizeResource(language),
        origin: translate(language.origin, lang),
        rarity: translateLanguageRarity(language.rarity).label,
      };
    },
    [lang, localizeResource, translateLanguageRarity],
  );
}
