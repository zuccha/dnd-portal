import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useTranslateFeatCategory } from "../../types/feat-category";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Feat, featSchema } from "./feat";

//------------------------------------------------------------------------------
// Localized Feat
//------------------------------------------------------------------------------

export const localizedFeatSchema = localizedResourceSchema(featSchema).extend({
  category: z.string(),
  info: z.string(),
  min_level: z.string(),
  prerequisite: z.string(),
});

export type LocalizedFeat = z.infer<typeof localizedFeatSchema>;

//------------------------------------------------------------------------------
// Use Localized Feat
//------------------------------------------------------------------------------

export function useLocalizeFeat(): (feat: Feat) => LocalizedFeat {
  const localizeResource = useLocalizeResource<Feat>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const translateFeatCategory = useTranslateFeatCategory(lang);

  return useCallback(
    (feat: Feat): LocalizedFeat => {
      const category = translateFeatCategory(feat.category).label;
      const description = translate(feat.description, lang);
      const prerequisite = translate(feat.prerequisite, lang);
      const min_level = feat.min_level ? `${feat.min_level}` : "";

      return {
        ...localizeResource(feat),
        descriptor: ti("subtitle", category),

        category,
        details: description,
        info: formatInfo([
          [t("min_level"), min_level],
          [t("prerequisite"), prerequisite],
        ]),
        min_level,
        prerequisite,
      };
    },
    [lang, localizeResource, t, ti, translateFeatCategory],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  min_level: {
    en: "Minimum Level",
    it: "Livello Minimo",
  },
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  subtitle: {
    en: "<1> Feat", // 1 = category
    it: "Talento <1>", // 1 = category
  },
};
