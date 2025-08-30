import { z } from "zod";
import { characterClassSchema, characterClasses } from "./character-class";
import { createTypeTranslation } from "./type-translation";

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
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCharacterClass,
  useTranslations: useCharacterClassTranslations,
} = createTypeTranslation(
  "character_class",
  characterClasses,
  characterClassTranslationSchema
);
