import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Feature, featureSchema } from "./feature";

//------------------------------------------------------------------------------
// Localized Feature
//------------------------------------------------------------------------------

export const localizedFeatureSchema = localizedResourceSchema(
  featureSchema,
);

export type LocalizedFeature = z.infer<typeof localizedFeatureSchema>;

//------------------------------------------------------------------------------
// Use Localized Feature
//------------------------------------------------------------------------------

export function useLocalizeFeature(): (feature: Feature) => LocalizedFeature {
  const localizeResource = useLocalizeResource<Feature>();
  const { lang, t } = useI18nLangContext(i18nContext);

  return useCallback(
    (feature: Feature): LocalizedFeature => {
      const details = translate(feature.description, lang);
      return {
        ...localizeResource(feature),
        descriptor: t("descriptor"),
        details,
      };
    },
    [lang, localizeResource, t],
  );
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
