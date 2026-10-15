import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useTranslateLanguageRarity } from "../../types/language-rarity";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Language, languageSchema } from "./language";

//------------------------------------------------------------------------------
// Localized Language
//------------------------------------------------------------------------------

export const localizedLanguageSchema = localizedResourceSchema(
  languageSchema,
  z.literal("language"),
).extend({
  origin: localizedFieldSchema,
  rarity: localizedFieldSchema,
});

export type LocalizedLanguage = z.infer<typeof localizedLanguageSchema>;

//------------------------------------------------------------------------------
// Language Localization Context
//------------------------------------------------------------------------------

type LanguageLocalizationContext = ResourceLocalizationContext & {
  translateLanguageRarity: (value: Language["rarity"]) => string;
};

//------------------------------------------------------------------------------
// Use Language Localization Context
//------------------------------------------------------------------------------

export function useLanguageLocalizationContext(_language: Language): LanguageLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateLanguageRarity = useTranslateLanguageRarity(context.lang);

  return useMemo(
    () => ({ ...context, translateLanguageRarity }),
    [context, translateLanguageRarity],
  );
}

//------------------------------------------------------------------------------
// Localize Language
//------------------------------------------------------------------------------

export function localizeLanguage(
  language: Language,
  context: LanguageLocalizationContext,
): LocalizedLanguage {
  const rarity = context.translateLanguageRarity(language.rarity);
  const origin = translate(language.origin, context.lang);

  return {
    ...localizeResource(language, context),
    descriptor: context.ti("subtitle", rarity),
    origin: { label: context.t("origin"), value: origin },
    rarity: { label: context.t("rarity"), value: rarity },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  origin: {
    en: "Origin",
    it: "Origine",
  },
  rarity: {
    en: "Rarity",
    it: "Rarità",
  },
  subtitle: {
    en: "<1> Language", // 1 = rarity
    it: "Lingua <1>", // 1 = rarity
  },
};
