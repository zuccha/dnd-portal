import { useMemo } from "react";
import { z } from "zod";
import { compareObjects } from "../utils/object";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Spell School
//------------------------------------------------------------------------------

export const spellSchoolSchema = z.enum([
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
]);

export const spellSchools = spellSchoolSchema.options;

export type SpellSchool = z.infer<typeof spellSchoolSchema>;

//------------------------------------------------------------------------------
// Spell School Translation
//------------------------------------------------------------------------------

export const spellSchoolTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  spell_school: spellSchoolSchema,
});

export type SpellSchoolTranslation = z.infer<
  typeof spellSchoolTranslationSchema
>;

//------------------------------------------------------------------------------
// Spell School Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateSpellSchool,
  useTranslations: useSpellSchoolTranslations,
} = createTypeTranslationHooks(
  "spell_school",
  spellSchools,
  spellSchoolTranslationSchema
);

//------------------------------------------------------------------------------
// Use Spell School Options
//------------------------------------------------------------------------------

export function useSpellSchoolOptions() {
  const spellSchoolTranslations = useSpellSchoolTranslations();

  return useMemo(
    () =>
      spellSchoolTranslations
        .map(({ spell_school, label }) => ({ label, value: spell_school }))
        .sort(compareObjects("label")),
    [spellSchoolTranslations]
  );
}
