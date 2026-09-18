import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Feature, featureSchema } from "./feature";

//------------------------------------------------------------------------------
// Localized Feature
//------------------------------------------------------------------------------

export const localizedFeatureSchema = localizedResourceSchema(featureSchema, z.literal("feature"));

export type LocalizedFeature = z.infer<typeof localizedFeatureSchema>;

//------------------------------------------------------------------------------
// Feature Localization Context
//------------------------------------------------------------------------------

type FeatureLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Feature Localization Context
//------------------------------------------------------------------------------

export function useFeatureLocalizationContext(_feature: Feature): FeatureLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Feature
//------------------------------------------------------------------------------

export function localizeFeature(
  feature: Feature,
  context: FeatureLocalizationContext,
): LocalizedFeature {
  return {
    ...localizeResource(feature, context),
    descriptor: context.t("descriptor"),
    details: translate(feature.description, context.lang),
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  descriptor: {
    en: "Feature",
    it: "Privilegio",
  },
};
