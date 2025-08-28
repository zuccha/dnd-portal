import { z } from "zod/v4";

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
