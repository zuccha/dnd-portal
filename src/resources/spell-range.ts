import { useMemo } from "react";
import { z } from "zod";
import { compareObjects } from "../utils/object";
import { createTypeTranslationHooks } from "./type";

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
// Spell Range Translation
//------------------------------------------------------------------------------

export const spellRangeTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  spell_range: spellRangeSchema,
});

export type SpellRangeTranslation = z.infer<typeof spellRangeTranslationSchema>;

//------------------------------------------------------------------------------
// Spell Range Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateSpellRange,
  useTranslations: useSpellRangeTranslations,
} = createTypeTranslationHooks(
  "spell_range",
  spellRanges,
  spellRangeTranslationSchema
);

//------------------------------------------------------------------------------
// Use Spell Range Options
//------------------------------------------------------------------------------

export function useSpellRangeOptions() {
  const spellRangeTranslations = useSpellRangeTranslations();

  return useMemo(
    () =>
      spellRangeTranslations
        .map(({ spell_range, label }) => ({ label, value: spell_range }))
        .sort(compareObjects("label")),
    [spellRangeTranslations]
  );
}
