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
// Use Character Level Options
//------------------------------------------------------------------------------

const characterLevelOptions = characterLevels.map((level) => ({
  label: `${level}`,
  value: `${level}`,
}));

export function useCharacterLevelOptions() {
  return characterLevelOptions;
}
