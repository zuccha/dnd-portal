import { useMemo } from "react";
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
// Spell Casting Time Translation
//------------------------------------------------------------------------------

export const spellCastingTimeTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  spell_casting_time: spellCastingTimeSchema,
});

export type SpellCastingTimeTranslation = z.infer<
  typeof spellCastingTimeTranslationSchema
>;

//------------------------------------------------------------------------------
// Spell Casting Time Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateSpellCastingTime,
  useTranslations: useSpellCastingTimeTranslations,
} = createTypeTranslationHooks(
  "spell_casting_time",
  spellCastingTimes,
  spellCastingTimeTranslationSchema
);

//------------------------------------------------------------------------------
// Use Spell Casting Time Options
//------------------------------------------------------------------------------

export function useSpellCastingTimeOptions() {
  const spellCastingTimeTranslations = useSpellCastingTimeTranslations();

  return useMemo(
    () =>
      spellCastingTimeTranslations.map(({ spell_casting_time, label }) => ({
        label,
        value: spell_casting_time,
      })),
    [spellCastingTimeTranslations]
  );
}
