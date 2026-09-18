import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { defaultFeature, type Feature } from "../resources/features/feature";
import { featureStore } from "../resources/features/feature-store";
import type { FeatureEntry } from "../resources/features/feature-entry";

//------------------------------------------------------------------------------
// Format Feature Entries
//------------------------------------------------------------------------------

function formatFeatureEntries(
  featureEntries: FeatureEntry[],
  features: Feature[],
  lang: string,
  ti: (key: string, ...args: string[]) => string,
): string {
  const featuresById = new Map(features.map((feature) => [feature.id, feature]));

  return featureEntries
    .map((entry) => {
      const feature = featuresById.get(entry.id) ?? defaultFeature;
      const name = (
        translate(feature.display_name, lang) ||
        translate(feature.name, lang) ||
        " "
      ).replace(" ", " ");
      const description = translate(feature.description, lang);
      return [
        entry.min_level ? ti("name.min_level", name, `${entry.min_level}`) : `##${name}##`,
        description,
      ]
        .filter(Boolean)
        .join("\r");
    })
    .filter(Boolean)
    .join("\n\n");
}

//------------------------------------------------------------------------------
// Use Localized Feature Entries
//------------------------------------------------------------------------------

const useFeatureResources = featureStore.useResources;

export function useLocalizedFeatureEntries(featureEntries: FeatureEntry[]): string {
  const { lang, ti } = useI18nLangContext(i18nContext);
  const featureIds = useMemo(
    () => featureEntries.map((featureEntry) => featureEntry.id),
    [featureEntries],
  );
  const features = useFeatureResources(featureIds);
  return useMemo(
    () => formatFeatureEntries(featureEntries, features, lang, ti),
    [featureEntries, features, lang, ti],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.min_level": {
    en: "##Level <2>: <1>##", // 1 = Name, 2 = Min Level
    it: "##Livello <2>: <1>##", // 1 = Name, 2 = Min Level
  },
};
