import { z } from "zod";
import { spellSchoolSchema, spellSchools } from "./spell-school";
import { createTypeTranslation } from "./type-translation";

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
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateSpellSchool,
  useTranslations: useSpellSchoolTranslations,
} = createTypeTranslation(
  "spell_school",
  spellSchools,
  spellSchoolTranslationSchema
);
