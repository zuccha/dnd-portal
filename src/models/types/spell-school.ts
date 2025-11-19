import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

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
// Spell School Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useSpellSchoolOptions,
  useTranslate: useTranslateSpellSchool,
  useTranslations: useSpellSchoolTranslations,
} = createTypeTranslationHooks(spellSchools, {
  abjuration: { en: "Abjuration", it: "Abiurazione" },
  conjuration: { en: "Conjuration", it: "Evocazione" },
  divination: { en: "Divination", it: "Divinazione" },
  enchantment: { en: "Enchantment", it: "Ammaliamento" },
  evocation: { en: "Evocation", it: "Invocazione" },
  illusion: { en: "Illusion", it: "Illusione" },
  necromancy: { en: "Necromancy", it: "Necromanzia" },
  transmutation: { en: "Transmutation", it: "Trasmutazione" },
});
