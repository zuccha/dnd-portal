import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

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
  useSortedOptions: useCreatureConditionOptions,
  useTranslate: useTranslateCreatureCondition,
  useTranslations: useCreatureConditionTranslations,
} = createTypeTranslationHooks(creatureConditions, {
  blinded: { en: "Blinded", it: "Accecato" },
  charmed: { en: "Charmed", it: "Affascinato" },
  deafened: { en: "Deafened", it: "Assordato" },
  exhaustion: { en: "Exhaustion", it: "Indebolimento" },
  frightened: { en: "Frightened", it: "Spaventato" },
  grappled: { en: "Grappled", it: "Afferrato" },
  incapacitated: { en: "Incapacitated", it: "Incapacitato" },
  invisible: { en: "Invisible", it: "Invisibile" },
  paralyzed: { en: "Paralyzed", it: "Paralizzato" },
  petrified: { en: "Petrified", it: "Pietrificato" },
  poisoned: { en: "Poisoned", it: "Avvelenato" },
  prone: { en: "Prone", it: "Prono" },
  restrained: { en: "Restrained", it: "Trattenuto" },
  stunned: { en: "Stunned", it: "Stordito" },
  unconscious: { en: "Unconscious", it: "Privo di sensi" },
});
