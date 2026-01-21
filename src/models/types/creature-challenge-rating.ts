import { z } from "zod";

//------------------------------------------------------------------------------
// Creature Challenge Rating
//------------------------------------------------------------------------------

export const creatureChallengeRatings = [
  0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
] as const;

export const creatureChallengeRatingSchema = z.union(
  creatureChallengeRatings.map((level) => z.literal(level)),
);

export const creatureChallengeRatingStringSchema = z.union(
  creatureChallengeRatings.map((level) => z.literal(`${level}`)),
);

export type CreatureChallengeRating = z.infer<
  typeof creatureChallengeRatingSchema
>;

export type CreatureChallengeRatingString = z.infer<
  typeof creatureChallengeRatingStringSchema
>;

//------------------------------------------------------------------------------
// Parse/Stringify Creature Challenge Rating
//------------------------------------------------------------------------------

export function parseCreatureChallengeRating(
  creatureChallengeRating: string,
): CreatureChallengeRating {
  if (creatureChallengeRating === "⅛") return 0.125;
  if (creatureChallengeRating === "¼") return 0.25;
  if (creatureChallengeRating === "½") return 0.5;
  const value = parseInt(creatureChallengeRating);
  return creatureChallengeRatings.includes(value as CreatureChallengeRating) ?
      (value as CreatureChallengeRating)
    : 0;
}

export function stringifyCreatureChallengeRating(
  creatureChallengeRating: CreatureChallengeRating,
): string {
  if (creatureChallengeRating === 0.125) return "⅛";
  if (creatureChallengeRating === 0.25) return "¼";
  if (creatureChallengeRating === 0.5) return "½";
  return `${creatureChallengeRating}`;
}

//------------------------------------------------------------------------------
// Use Creature Challenge Rating Options
//------------------------------------------------------------------------------

const creatureChallengeRatingOptions = creatureChallengeRatings.map(
  (value) => ({
    label: stringifyCreatureChallengeRating(value),
    value: value,
  }),
);

export function useCreatureChallengeRatingOptions() {
  return creatureChallengeRatingOptions;
}
