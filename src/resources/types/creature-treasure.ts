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
  // TODO: Localize IT.
  any: { en: "Any", it: "" },
  arcana: { en: "Arcana", it: "" },
  armaments: { en: "Armaments", it: "" },
  implements: { en: "Implements", it: "" },
  individual: { en: "Individual", it: "" },
  none: { en: "None", it: "" },
  relics: { en: "Relics", it: "" },
});
