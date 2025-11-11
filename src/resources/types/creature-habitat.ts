import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Habitat
//------------------------------------------------------------------------------

export const creatureHabitatSchema = z.enum([
  "any",
  "arctic",
  "coastal",
  "desert",
  "forest",
  "grassland",
  "hill",
  "mountain",
  "planar",
  "swamp",
  "underdark",
  "underwater",
  "urban",
]);

export const creatureHabitats = creatureHabitatSchema.options;

export type CreatureHabitat = z.infer<typeof creatureHabitatSchema>;

//------------------------------------------------------------------------------
// Creature Habitat Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useCreatureHabitatOptions,
  useTranslate: useTranslateCreatureHabitat,
  useTranslations: useCreatureHabitatTranslations,
} = createTypeTranslationHooks(creatureHabitats, {
  // TODO: Localize IT.
  any: { en: "Any", it: "" },
  arctic: { en: "Arctic", it: "" },
  coastal: { en: "Coastal", it: "" },
  desert: { en: "Desert", it: "" },
  forest: { en: "Forest", it: "" },
  grassland: { en: "Grassland", it: "" },
  hill: { en: "Hill", it: "" },
  mountain: { en: "Mountain", it: "" },
  planar: { en: "Planar", it: "" },
  swamp: { en: "Swamp", it: "" },
  underdark: { en: "Underdark", it: "" },
  underwater: { en: "Underwater", it: "" },
  urban: { en: "Urban", it: "" },
});
