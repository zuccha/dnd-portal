import { useMemo } from "react";
import z from "zod";
import { useTranslateCreatureTreasure } from "../../types/creature-treasure";
import { creatureHabitatStore } from "../creature-habitats/creature-habitat-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureFamily, creatureFamilySchema } from "./creature-family";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Creature Family
//------------------------------------------------------------------------------

export const localizedCreatureFamilySchema = localizedResourceSchema(
  creatureFamilySchema,
  z.literal("creature_family"),
).extend({
  habitats: z.string(),
  treasures: z.string(),
});

export type LocalizedCreatureFamily = z.infer<typeof localizedCreatureFamilySchema>;

//------------------------------------------------------------------------------
// Creature Family Localization Context
//------------------------------------------------------------------------------

type CreatureFamilyLocalizationContext = ResourceLocalizationContext & {
  habitats: string;
  translateTreasure: ReturnType<typeof useTranslateCreatureTreasure>;
};

const useLocalizedHabitatNames = creatureHabitatStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Use Creature Family Localization Context
//------------------------------------------------------------------------------

export function useCreatureFamilyLocalizationContext(
  _family: CreatureFamily,
  related: RelatedResourceEntries<"creature_family">,
): CreatureFamilyLocalizationContext {
  const context = useResourceLocalizationContext();
  const habitatNames = useLocalizedHabitatNames(related.habitats.map(({ id }) => id));
  const translateTreasure = useTranslateCreatureTreasure(context.lang);
  const habitats = habitatNames.filter(Boolean).join(", ");

  return useMemo(
    () => ({ ...context, habitats, translateTreasure }),
    [context, habitats, translateTreasure],
  );
}

//------------------------------------------------------------------------------
// Localize Creature Family
//------------------------------------------------------------------------------

export function localizeCreatureFamily(
  family: CreatureFamily,
  context: CreatureFamilyLocalizationContext,
): LocalizedCreatureFamily {
  return {
    ...localizeResource(family, context),
    habitats: context.habitats,
    treasures: (family.treasures ?? []).map(context.translateTreasure).join(", "),
  };
}
