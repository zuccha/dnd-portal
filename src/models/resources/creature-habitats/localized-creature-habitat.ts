import z from "zod";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureHabitat, creatureHabitatSchema } from "./creature-habitat";

//------------------------------------------------------------------------------
// Localized Creature Habitat
//------------------------------------------------------------------------------

export const localizedCreatureHabitatSchema = localizedResourceSchema(
  creatureHabitatSchema,
  z.literal("creature_habitat"),
);

export type LocalizedCreatureHabitat = z.infer<typeof localizedCreatureHabitatSchema>;

//------------------------------------------------------------------------------
// Use Creature Habitat Localization Context
//------------------------------------------------------------------------------

export function useCreatureHabitatLocalizationContext(
  _habitat: CreatureHabitat,
): ResourceLocalizationContext {
  return useResourceLocalizationContext();
}

//------------------------------------------------------------------------------
// Localize Creature Habitat
//------------------------------------------------------------------------------

export function localizeCreatureHabitat(
  habitat: CreatureHabitat,
  context: ResourceLocalizationContext,
): LocalizedCreatureHabitat {
  return localizeResource(habitat, context);
}
