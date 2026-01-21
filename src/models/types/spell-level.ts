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
// Parse/Stringify Spell Level
//------------------------------------------------------------------------------

export function parseSpellLevel(spellLevel: string): SpellLevel {
  const value = parseInt(spellLevel);
  return spellLevels.includes(value as SpellLevel) ? (value as SpellLevel) : 0;
}

export function stringifySpellLevel(spellLevel: SpellLevel): string {
  return `${spellLevel}`;
}

//------------------------------------------------------------------------------
// Use Spell Level Options
//------------------------------------------------------------------------------

const spellLevelOptions = spellLevels.map((value) => ({
  label: `${value}`,
  value: value,
}));

export function useSpellLevelOptions() {
  return spellLevelOptions;
}
