import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Type
//------------------------------------------------------------------------------

export const creatureTypeSchema = z.enum([
  "aberration",
  "beast",
  "celestial",
  "construct",
  "dragon",
  "elemental",
  "fey",
  "fiend",
  "giant",
  "humanoid",
  "monstrosity",
  "ooze",
  "plant",
  "undead",
]);

export const creatureTypes = creatureTypeSchema.options;

export type CreatureType = z.infer<typeof creatureTypeSchema>;

//------------------------------------------------------------------------------
// Creature Type Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCreatureType,
  useTranslations: useCreatureTypeTranslations,
} = createTypeTranslationHooks(creatureTypes, {
  aberration: { en: "Aberration", it: "Aberrazione" },
  beast: { en: "Beast", it: "Bestia" },
  celestial: { en: "Celestial", it: "Celestiale" },
  construct: { en: "Construct", it: "Costrutto" },
  dragon: { en: "Dragon", it: "Drago" },
  elemental: { en: "Elemental", it: "Elementale" },
  fey: { en: "Fey", it: "Folletto" },
  fiend: { en: "Fiend", it: "Immondo" },
  giant: { en: "Giant", it: "Gigante" },
  humanoid: { en: "Humanoid", it: "Umanoide" },
  monstrosity: { en: "Monstrosity", it: "Mostruosità" },
  ooze: { en: "Ooze", it: "Melma" },
  plant: { en: "Plant", it: "Vegetale" },
  undead: { en: "Undead", it: "Non Morto" },
});
