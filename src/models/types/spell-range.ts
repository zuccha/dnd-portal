import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Spell Range
//------------------------------------------------------------------------------

export const spellRangeSchema = z.enum([
  "self",
  "sight",
  "special",
  "touch",
  "unlimited",
  "value",
]);

export const spellRanges = spellRangeSchema.options;

export type SpellRange = z.infer<typeof spellRangeSchema>;

//------------------------------------------------------------------------------
// Spell Range Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useSpellRangeOptions,
  useTranslate: useTranslateSpellRange,
  useTranslations: useSpellRangeTranslations,
} = createTypeTranslationHooks(spellRanges, {
  self: { en: "Self", it: "Incantatore" },
  sight: { en: "Sight", it: "Vista" },
  special: { en: "Special", it: "Speciale" },
  touch: { en: "Touch", it: "Contatto" },
  unlimited: { en: "Unlimited", it: "Illimitato" },
  value: { en: "Value", it: "Valore" },
});
