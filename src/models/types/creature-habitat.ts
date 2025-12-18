import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

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
  any: { en: "Anywhere", it: "Ovunque" },
  arctic: { en: "Arctic", it: "Artico" },
  coastal: { en: "Coastal", it: "Costa" },
  desert: { en: "Desert", it: "Deserto" },
  forest: { en: "Forest", it: "Foresta" },
  grassland: { en: "Grassland", it: "Prateria" },
  hill: { en: "Hill", it: "Collina" },
  mountain: { en: "Mountain", it: "Montagna" },
  planar: { en: "Planar", it: "Planare" },
  swamp: { en: "Swamp", it: "Palude" },
  underdark: { en: "Underdark", it: "Sottosuolo" },
  underwater: { en: "Underwater", it: "Sott'Acqua" },
  urban: { en: "Urban", it: "Città" },
});
