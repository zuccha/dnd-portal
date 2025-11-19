import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Spell Duration
//------------------------------------------------------------------------------

export const spellDurationSchema = z.enum([
  "instantaneous",
  "special",
  "until_dispelled",
  "until_dispelled_or_triggered",
  "value",
]);

export const spellDurations = spellDurationSchema.options;

export type SpellDuration = z.infer<typeof spellDurationSchema>;

//------------------------------------------------------------------------------
// Spell Duration Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSpellDurationOptions,
  useTranslate: useTranslateSpellDuration,
  useTranslations: useSpellDurationTranslations,
} = createTypeTranslationHooks(spellDurations, {
  instantaneous: { en: "Instantaneous", it: "Istantaneo" },
  special: { en: "Special", it: "Speciale" },
  until_dispelled: { en: "Until dispelled", it: "Finché non disperso" },
  until_dispelled_or_triggered: {
    en: "Until Dispelled or Triggered",
    it: "Finché non disperso o innescato",
  },
  value: { en: "Value", it: "Valore" },
});
