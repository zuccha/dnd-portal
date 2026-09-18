import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateFeatCategory } from "../../types/feat-category";
import {
  type ResourceLocalizationContext,
  formatDetails,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Feat, featSchema } from "./feat";

//------------------------------------------------------------------------------
// Localized Feat
//------------------------------------------------------------------------------

export const localizedFeatSchema = localizedResourceSchema(featSchema, z.literal("feat")).extend({
  category: z.string(),
  info: z.string(),
  min_level: z.string(),
  prerequisite: z.string(),
});

export type LocalizedFeat = z.infer<typeof localizedFeatSchema>;

//------------------------------------------------------------------------------
// Feat Localization Context
//------------------------------------------------------------------------------

type FeatLocalizationContext = ResourceLocalizationContext & {
  featureEntries: string;
  translateFeatCategory: ReturnType<typeof useTranslateFeatCategory>;
};

//------------------------------------------------------------------------------
// Use Feat Localization Context
//------------------------------------------------------------------------------

export function useFeatLocalizationContext(feat: Feat): FeatLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const featureEntries = useLocalizedFeatureEntries(feat.feature_entries);
  const translateFeatCategory = useTranslateFeatCategory(context.lang);

  return useMemo(
    () => ({ ...context, featureEntries, translateFeatCategory }),
    [context, featureEntries, translateFeatCategory],
  );
}

//------------------------------------------------------------------------------
// Localize Feat
//------------------------------------------------------------------------------

export function localizeFeat(feat: Feat, context: FeatLocalizationContext): LocalizedFeat {
  const category = context.translateFeatCategory(feat.category);
  const description = translate(feat.description, context.lang);
  const features = context.featureEntries;
  const prerequisite = translate(feat.prerequisite, context.lang);
  const min_level = feat.min_level ? `${feat.min_level}` : "";

  return {
    ...localizeResource(feat, context),
    descriptor: context.ti("subtitle", category),
    category,
    details: formatDetails(description, features),
    info: formatInfo([
      [context.t("min_level"), min_level],
      [context.t("prerequisite"), prerequisite],
    ]),
    min_level,
    prerequisite,
  };
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
