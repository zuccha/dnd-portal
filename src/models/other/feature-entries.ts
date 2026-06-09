import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { DBFeatureEntry } from "../resources/features/db-feature";
import { defaultFeature } from "../resources/features/feature";
import { featureStore } from "../resources/features/feature-store";

//------------------------------------------------------------------------------
// Use Format Feature Entries
//------------------------------------------------------------------------------

const { useAllResourceIds, useResources } = featureStore;

export function useFormatFeatureEntries(
  sourceId: string,
): (featureEntries: DBFeatureEntry[]) => string {
  const { lang, ti } = useI18nLangContext(i18nContext);

  const featureIds = useAllResourceIds(sourceId);
  const features = useResources(featureIds);
  const featureMap = useMemo(
    () => new Map(features.map((feature) => [feature.id, feature])),
    [features],
  );

  return useCallback(
    (featureEntries: DBFeatureEntry[]): string =>
      featureEntries
        .map((entry) => {
          const feature = featureMap.get(entry.id) ?? defaultFeature;
          const name =
            translate(feature.display_name, lang) ||
            translate(feature.name, lang) ||
            "???";
          const description = translate(feature.description, lang);
          return [
            entry.min_level ?
              ti("name.min_level", name, `${entry.min_level}`)
            : `##${name}##`,
            description,
          ]
            .filter(Boolean)
            .join("\r");
        })
        .filter(Boolean)
        .join("\n\n"),
    [featureMap, lang, ti],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.min_level": {
    en: "##Level <2>: <1>##", // 1 = Name, 2 = Min Level
    it: "##Livello <2>: <1>##", // 1 = Name, 2 = Min Level
  },
};
