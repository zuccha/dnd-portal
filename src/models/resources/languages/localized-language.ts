import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useTranslateLanguageRarity } from "../../types/language-rarity";
import {
  formatInfo,
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
  info: z.string(),
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
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  const translateLanguageRarity = useTranslateLanguageRarity(lang);

  return useCallback(
    (language: Language): LocalizedLanguage => {
      const rarity = translateLanguageRarity(language.rarity).label;
      const origin = translate(language.origin, lang);

      return {
        ...localizeResource(language),
        descriptor: ti("subtitle", rarity),

        info: formatInfo([[t("origin"), origin]]),
        origin,
        rarity,
      };
    },
    [lang, localizeResource, t, ti, translateLanguageRarity],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  origin: {
    en: "Origin",
    it: "Origine",
  },
  subtitle: {
    en: "<1> Language", // 1 = rarity
    it: "Lingua <1>", // 1 = rarity
  },
};
