import { useMemo } from "react";
import z from "zod";
import { creatureHabitatStore } from "../creature-habitats/creature-habitat-store";
import { creatureTreasureStore } from "../creature-treasures/creature-treasure-store";
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

//------------------------------------------------------------------------------
// Localized Creature Family
//------------------------------------------------------------------------------

export type LocalizedCreatureFamily = z.infer<typeof localizedCreatureFamilySchema>;

//------------------------------------------------------------------------------
// Creature Family Localization Context
//------------------------------------------------------------------------------

type CreatureFamilyLocalizationContext = ResourceLocalizationContext & {
  habitats: string;
  treasures: string;
};

const useLocalizedHabitatNames = creatureHabitatStore.useLocalizedResourceNames;
const useLocalizedTreasureNames = creatureTreasureStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Use Creature Family Localization Context
//------------------------------------------------------------------------------

export function useCreatureFamilyLocalizationContext(
  _family: CreatureFamily,
  related: RelatedResourceEntries<"creature_family">,
): CreatureFamilyLocalizationContext {
  const context = useResourceLocalizationContext();
  const habitatNames = useLocalizedHabitatNames(related.habitats.map(({ id }) => id));
  const treasureNames = useLocalizedTreasureNames(related.treasures.map(({ id }) => id));
  const habitats = habitatNames.filter(Boolean).join(", ");
  const treasures = treasureNames.filter(Boolean).join(", ");

  return useMemo(() => ({ ...context, habitats, treasures }), [context, habitats, treasures]);
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
    treasures: context.treasures,
  };
}
