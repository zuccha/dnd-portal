import { z } from "zod";

//------------------------------------------------------------------------------
// Character Level
//------------------------------------------------------------------------------

export const characterLevels = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

export const characterLevelSchema = z.union(
  characterLevels.map((level) => z.literal(level)),
);

export const characterLevelStringSchema = z.union(
  characterLevels.map((level) => z.literal(`${level}`)),
);

export type CharacterLevel = z.infer<typeof characterLevelSchema>;

export type CharacterLevelString = z.infer<typeof characterLevelStringSchema>;

//------------------------------------------------------------------------------
// Parse/Stringify Character Level
//------------------------------------------------------------------------------

export function parseCharacterLevel(characterLevel: string): CharacterLevel {
  const value = parseInt(characterLevel);
  return characterLevels.includes(value as CharacterLevel) ?
      (value as CharacterLevel)
    : 0;
}

export function stringifyCharacterLevel(
  characterLevel: CharacterLevel,
): string {
  return `${characterLevel}`;
}

//------------------------------------------------------------------------------
// Use Character Level Options
//------------------------------------------------------------------------------

const characterLevelOptions = characterLevels.map((value) => ({
  label: stringifyCharacterLevel(value),
  value: value,
}));

export function useCharacterLevelOptions() {
  return characterLevelOptions;
}
