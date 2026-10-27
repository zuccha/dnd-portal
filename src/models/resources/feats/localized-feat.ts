import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateFeatCategory } from "../../types/feat-category";
import {
  type ResourceLocalizationContext,
  formatDescription,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Feat, featSchema } from "./feat";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Feat
//------------------------------------------------------------------------------

export const localizedFeatSchema = localizedResourceSchema(featSchema, z.literal("feat")).extend({
  category: z.string(),
  minimum_level: localizedFieldSchema,
  prerequisite: localizedFieldSchema,
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

export function useFeatLocalizationContext(
  _feat: Feat,
  related: RelatedResourceEntries<"feat">,
): FeatLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const featureEntries = useLocalizedFeatureEntries(related.features, true);
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
  const minLevel = feat.minimum_level ? `${feat.minimum_level}` : "";

  return {
    ...localizeResource(feat, context),
    descriptor: context.ti("descriptor", category),
    category,
    description: formatDescription(description, features),

    minimum_level: { label: context.t("min_level"), value: minLevel },
    prerequisite: { label: context.t("prerequisite"), value: prerequisite },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  descriptor: {
    en: "<1> Feat", // 1 = category
    it: "Talento <1>", // 1 = category
  },
  min_level: {
    en: "Minimum Level",
    it: "Livello Minimo",
  },
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
