import { z } from "zod/v4";

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
