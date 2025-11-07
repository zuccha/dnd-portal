import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Condition
//------------------------------------------------------------------------------

export const creatureConditionSchema = z.enum([
  "blinded",
  "charmed",
  "deafened",
  "exhaustion",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
]);

export const creatureConditions = creatureConditionSchema.options;

export type CreatureCondition = z.infer<typeof creatureConditionSchema>;

//------------------------------------------------------------------------------
// Creature Condition Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCreatureCondition,
  useTranslations: useCreatureConditionTranslations,
} = createTypeTranslationHooks(creatureConditions, {
  // TODO: Localize IT.
  blinded: { en: "Blinded", it: "" },
  charmed: { en: "Charmed", it: "" },
  deafened: { en: "Deafened", it: "" },
  exhaustion: { en: "Exhaustion", it: "" },
  frightened: { en: "Frightened", it: "" },
  grappled: { en: "Grappled", it: "" },
  incapacitated: { en: "Incapacitated", it: "" },
  invisible: { en: "Invisible", it: "" },
  paralyzed: { en: "Paralyzed", it: "" },
  petrified: { en: "Petrified", it: "" },
  poisoned: { en: "Poisoned", it: "" },
  prone: { en: "Prone", it: "" },
  restrained: { en: "Restrained", it: "" },
  stunned: { en: "Stunned", it: "" },
  unconscious: { en: "Unconscious", it: "" },
});
