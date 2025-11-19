import { z } from "zod";

//------------------------------------------------------------------------------
// Spell Level
//------------------------------------------------------------------------------

export const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const spellLevelSchema = z.union(
  spellLevels.map((level) => z.literal(level)),
);

export const spellLevelStringSchema = z.union(
  spellLevels.map((level) => z.literal(`${level}`)),
);

export type SpellLevel = z.infer<typeof spellLevelSchema>;

export type SpellLevelString = z.infer<typeof spellLevelStringSchema>;

//------------------------------------------------------------------------------
// Use Spell Level Options
//------------------------------------------------------------------------------

const spellLevelOptions = spellLevels.map((level) => ({
  label: `${level}`,
  value: `${level}`,
}));

export function useSpellLevelOptions() {
  return spellLevelOptions;
}
