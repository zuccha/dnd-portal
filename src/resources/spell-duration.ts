import { useMemo } from "react";
import { z } from "zod";
import { createTypeTranslationHooks } from "./type";

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
// Spell Duration Translation
//------------------------------------------------------------------------------

export const spellDurationTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  spell_duration: spellDurationSchema,
});

export type SpellDurationTranslation = z.infer<
  typeof spellDurationTranslationSchema
>;

//------------------------------------------------------------------------------
// Spell Duration Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateSpellDuration,
  useTranslations: useSpellDurationTranslations,
} = createTypeTranslationHooks(
  "spell_duration",
  spellDurations,
  spellDurationTranslationSchema
);

//------------------------------------------------------------------------------
// Use Spell Duration Options
//------------------------------------------------------------------------------

export function useSpellDurationOptions() {
  const spellDurationTranslations = useSpellDurationTranslations();

  return useMemo(
    () =>
      spellDurationTranslations.map(({ spell_duration, label }) => ({
        label,
        value: spell_duration,
      })),
    [spellDurationTranslations]
  );
}
