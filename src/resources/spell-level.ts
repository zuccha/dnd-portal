import { z } from "zod";

//------------------------------------------------------------------------------
// Spell Level
//------------------------------------------------------------------------------

export const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const spellLevelSchema = z.union(
  spellLevels.map((level) => z.literal(level))
);

export type SpellLevel = z.infer<typeof spellLevelSchema>;
