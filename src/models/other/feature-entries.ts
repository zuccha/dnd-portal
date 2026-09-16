import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { defaultFeature } from "../resources/features/feature";
import { featureStore } from "../resources/features/feature-store";
import type { FeatureEntry } from "../resources/features/feature-entry";

//------------------------------------------------------------------------------
// Feature Entries Localization Context
//------------------------------------------------------------------------------

export type FeatureEntriesLocalizationContext = {
  getFeature: (featureId: string) => ReturnType<typeof featureStore.getResource>;
  lang: string;
  ti: (key: string, ...args: string[]) => string;
};

//------------------------------------------------------------------------------
// Format Feature Entries
//------------------------------------------------------------------------------

export function formatFeatureEntries(
  featureEntries: FeatureEntry[],
  context: FeatureEntriesLocalizationContext,
): string {
  return featureEntries
    .map((entry) => {
      const feature = context.getFeature(entry.id) ?? defaultFeature;
      const name = (
        translate(feature.display_name, context.lang) ||
        translate(feature.name, context.lang) ||
        " "
      ).replace(" ", " ");
      const description = translate(feature.description, context.lang);
      return [
        entry.min_level ? context.ti("name.min_level", name, `${entry.min_level}`) : `##${name}##`,
        description,
      ]
        .filter(Boolean)
        .join("\r");
    })
    .filter(Boolean)
    .join("\n\n");
}

//------------------------------------------------------------------------------
// Use Format Feature Entries
//------------------------------------------------------------------------------

const { useResourceIds, useResources } = featureStore;

export function useFormatFeatureEntries(
  sourceId: string,
): (featureEntries: FeatureEntry[]) => string {
  const { lang, ti } = useI18nLangContext(i18nContext);

  const featureIds = useResourceIds(sourceId);
  const features = useResources(featureIds);
  const featureMap = useMemo(
    () => new Map(features.map((feature) => [feature.id, feature])),
    [features],
  );

  return useCallback(
    (featureEntries) =>
      formatFeatureEntries(featureEntries, { getFeature: featureMap.get, lang, ti }),
    [featureMap, lang, ti],
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
