import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Treasure
//------------------------------------------------------------------------------

export const creatureTreasureSchema = z.enum([
  "any",
  "individual",
  "arcana",
  "armaments",
  "implements",
  "relics",
  "none",
]);

export const creatureTreasures = creatureTreasureSchema.options;

export type CreatureTreasure = z.infer<typeof creatureTreasureSchema>;

//------------------------------------------------------------------------------
// Creature Treasure Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useCreatureTreasureOptions,
  useTranslate: useTranslateCreatureTreasure,
  useTranslations: useCreatureTreasureTranslations,
} = createTypeTranslationHooks(creatureTreasures, {
  any: { en: "Any", it: "Qualsiasi" },
  arcana: { en: "Arcana", it: "Arcano" },
  armaments: { en: "Armaments", it: "Armamenti" },
  implements: { en: "Implements", it: "Strumenti" },
  individual: { en: "Individual", it: "Individuale" },
  none: { en: "None", it: "Nessuno" },
  relics: { en: "Relics", it: "Reliquie" },
});
