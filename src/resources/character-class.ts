import { useMemo } from "react";
import { z } from "zod";
import { compareObjects } from "../utils/object";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Character Class
//------------------------------------------------------------------------------

export const characterClassSchema = z.enum([
  "artificer",
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
]);

export const characterClasses = characterClassSchema.options;

export type CharacterClass = z.infer<typeof characterClassSchema>;

//------------------------------------------------------------------------------
// Character Class Translation
//------------------------------------------------------------------------------

export const characterClassTranslationSchema = z.object({
  character_class: characterClassSchema,
  label: z.string().default(""),
  label_short: z.string().default(""),
  lang: z.string().default("en"),
});

export type CharacterClassTranslation = z.infer<
  typeof characterClassTranslationSchema
>;

//------------------------------------------------------------------------------
// Character Class Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCharacterClass,
  useTranslations: useCharacterClassTranslations,
} = createTypeTranslationHooks(
  "character_class",
  characterClasses,
  characterClassTranslationSchema
);

//------------------------------------------------------------------------------
// Use Character Class Options
//------------------------------------------------------------------------------

export function useCharacterClassOptions() {
  const characterClassTranslations = useCharacterClassTranslations();

  return useMemo(
    () =>
      characterClassTranslations
        .map(({ character_class, label }) => ({
          label,
          value: character_class,
        }))
        .sort(compareObjects("label")),
    [characterClassTranslations]
  );
}
