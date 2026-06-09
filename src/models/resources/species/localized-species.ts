import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { useFormatCmWithUnit } from "~/measures/distance";
import { useTranslateCreatureSize } from "../../types/creature-size";
import { useTranslateCreatureType } from "../../types/creature-type";
import { useFormatFeatureEntries } from "../../other/feature-entries";
import {
  formatDetails,
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Species, speciesSchema } from "./species";

//------------------------------------------------------------------------------
// Localized Species
//------------------------------------------------------------------------------

export const localizedSpeciesSchema = localizedResourceSchema(
  speciesSchema,
).extend({
  details: z.string(),
  info: z.string(),
  sizes: z.string(),
  speed: z.string(),
  type: z.string(),
});

export type LocalizedSpecies = z.infer<typeof localizedSpeciesSchema>;

//------------------------------------------------------------------------------
// Use Localized Species
//------------------------------------------------------------------------------

export function useLocalizeSpecies(
  sourceId: string,
): (species: Species) => LocalizedSpecies {
  const localizeResource = useLocalizeResource<Species>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  const translateCreatureSize = useTranslateCreatureSize(lang);
  const translateCreatureType = useTranslateCreatureType(lang);
  const formatFeatureEntriesDetails = useFormatFeatureEntries(sourceId);

  const [system] = useI18nSystem();
  const formatCm = useFormatCmWithUnit(system === "metric" ? "m" : "ft");

  return useCallback(
    (species: Species): LocalizedSpecies => {
      const description = translate(species.description, lang);
      const features = formatFeatureEntriesDetails(species.feature_entries);
      const sizes = species.sizes
        .map((size) => translateCreatureSize(size).label)
        .join("/");
      const type = translateCreatureType(species.type).label;
      const speed = formatCm(species.speed);

      return {
        ...localizeResource(species),
        descriptor: ti("descriptor", sizes, type),

        details: formatDetails(description, features),
        info: formatInfo([[t("speed"), speed]]),
        sizes,
        speed,
        type,
      };
    },
    [
      formatCm,
      formatFeatureEntriesDetails,
      lang,
      localizeResource,
      t,
      ti,
      translateCreatureSize,
      translateCreatureType,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  descriptor: {
    en: "<1> <2>", // 1 = sizes, 2 = type
    it: "<2> <1>", // 1 = sizes, 2 = type
  },
  sizes: {
    en: "Sizes",
    it: "Taglie",
  },
  speed: {
    en: "Speed",
    it: "Velocità",
  },
  type: {
    en: "Type",
    it: "Tipo",
  },
};
