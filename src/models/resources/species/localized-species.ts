import { useCallback, useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useI18nSystem } from "~/i18n/i18n-system";
import { useFormatCmWithUnit } from "~/measures/distance";
import { useFormatFeatureEntries } from "../../other/feature-entries";
import { useTranslateCreatureSize } from "../../types/creature-size";
import { useTranslateCreatureType } from "../../types/creature-type";
import {
  type ResourceLocalizationContext,
  formatDetails,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Species, speciesSchema } from "./species";

//------------------------------------------------------------------------------
// Localized Species
//------------------------------------------------------------------------------

export const localizedSpeciesSchema = localizedResourceSchema(
  speciesSchema,
  z.literal("species"),
).extend({
  details: z.string(),
  info: z.string(),
  sizes: z.string(),
  speed: z.string(),
  type: z.string(),
});

export type LocalizedSpecies = z.infer<typeof localizedSpeciesSchema>;

//------------------------------------------------------------------------------
// Species Localization Context
//------------------------------------------------------------------------------

type SpeciesLocalizationContext = ResourceLocalizationContext & {
  formatCm: ReturnType<typeof useFormatCmWithUnit>;
  formatFeatureEntries: ReturnType<typeof useFormatFeatureEntries>;
  translateCreatureSize: ReturnType<typeof useTranslateCreatureSize>;
  translateCreatureType: ReturnType<typeof useTranslateCreatureType>;
};

//------------------------------------------------------------------------------
// Use Species Localization Context
//------------------------------------------------------------------------------

function useSpeciesLocalizationContext(sourceId: string): SpeciesLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);

  const translateCreatureSize = useTranslateCreatureSize(context.lang);
  const translateCreatureType = useTranslateCreatureType(context.lang);
  const formatFeatureEntries = useFormatFeatureEntries(sourceId);

  const [system] = useI18nSystem();
  const formatCm = useFormatCmWithUnit(system === "metric" ? "m" : "ft");

  return useMemo(
    () => ({
      ...context,
      formatCm,
      formatFeatureEntries,
      translateCreatureSize,
      translateCreatureType,
    }),
    [context, formatCm, formatFeatureEntries, translateCreatureSize, translateCreatureType],
  );
}

//------------------------------------------------------------------------------
// Localize Species
//------------------------------------------------------------------------------

function localizeSpecies(species: Species, context: SpeciesLocalizationContext): LocalizedSpecies {
  const description = translate(species.description, context.lang);
  const features = context.formatFeatureEntries(species.feature_entries);
  const sizes = species.sizes.map(context.translateCreatureSize).join("/");
  const type = context.translateCreatureType(species.type);
  const speed = context.formatCm(species.speed);

  return {
    ...localizeResource(species, context),
    descriptor: context.ti("descriptor", sizes, type),

    details: formatDetails(description, features),
    info: formatInfo([[context.t("speed"), speed]]),
    sizes,
    speed,
    type,
  };
}

//------------------------------------------------------------------------------
// Use Localize Species
//------------------------------------------------------------------------------

export function useLocalizeSpecies(sourceId: string): (species: Species) => LocalizedSpecies {
  const context = useSpeciesLocalizationContext(sourceId);
  return useCallback((species) => localizeSpecies(species, context), [context]);
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
