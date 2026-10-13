import z from "zod";
import { useTranslateCreatureHabitat } from "../../types/creature-habitat";
import { useTranslateCreatureTreasure } from "../../types/creature-treasure";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureFamily, creatureFamilySchema } from "./creature-family";

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
  translateHabitat: ReturnType<typeof useTranslateCreatureHabitat>;
  translateTreasure: ReturnType<typeof useTranslateCreatureTreasure>;
};

//------------------------------------------------------------------------------
// Use Creature Family Localization Context
//------------------------------------------------------------------------------

export function useCreatureFamilyLocalizationContext(
  _family: CreatureFamily,
): CreatureFamilyLocalizationContext {
  const context = useResourceLocalizationContext();
  const translateHabitat = useTranslateCreatureHabitat(context.lang);
  const translateTreasure = useTranslateCreatureTreasure(context.lang);

  return {
    ...context,
    translateHabitat,
    translateTreasure,
  };
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
    habitats: (family.habitats ?? []).map(context.translateHabitat).join(", "),
    treasures: (family.treasures ?? []).map(context.translateTreasure).join(", "),
  };
}
