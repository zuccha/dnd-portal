import { z } from "zod";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Spell Casting Time
//------------------------------------------------------------------------------

export const spellCastingTimeSchema = z.enum([
  "action",
  "bonus_action",
  "reaction",
  "value",
]);

export const spellCastingTimes = spellCastingTimeSchema.options;

export type SpellCastingTime = z.infer<typeof spellCastingTimeSchema>;

//------------------------------------------------------------------------------
// Spell Casting Time Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSpellCastingTimeOptions,
  useTranslate: useTranslateSpellCastingTime,
  useTranslations: useSpellCastingTimeTranslations,
} = createTypeTranslationHooks(spellCastingTimes, {
  action: { en: "Action", it: "Azione" },
  bonus_action: { en: "Azione Bonus", it: "Azione Bonus" },
  reaction: { en: "Reaction", it: "Reazione" },
  value: { en: "Value", it: "Valore" },
});
