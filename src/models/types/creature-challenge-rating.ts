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

//------------------------------------------------------------------------------
// Infer Creature Values From Challenge Rating
//------------------------------------------------------------------------------

export function inferCreatureExp(cr: CreatureChallengeRating): number {
  return crToExp[cr] ?? 0;
}

export function inferCreatureLairExp(cr: CreatureChallengeRating): number {
  return crToLairExp[cr] ?? inferCreatureExp(cr);
}

export function inferCreaturePb(cr: CreatureChallengeRating): number {
  return crToPb[cr] ?? 2;
}

/* eslint-disable sort-keys */
const crToExp: Record<number, number> = {
  0: 0,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};
/* eslint-enable sort-keys */

/* eslint-disable sort-keys */
const crToLairExp: Record<number, number> = {
  0: 25,
  0.125: 50,
  0.25: 100,
  0.5: 200,
  1: 450,
  2: 700,
  3: 1100,
  4: 1800,
  5: 2300,
  6: 2900,
  7: 3900,
  8: 5000,
  9: 5900,
  10: 7200,
  11: 8400,
  13: 11500,
  14: 13000,
  15: 15000,
  16: 18000,
  17: 20000,
  18: 22000,
  19: 25000,
  20: 33000,
  21: 41000,
  22: 50000,
  23: 62000,
  24: 75000,
  25: 90000,
  26: 105000,
  27: 120000,
  28: 135000,
  29: 155000,
  30: 180000,
};
/* eslint-enable sort-keys */

/* eslint-disable sort-keys */
const crToPb: Record<number, number> = {
  0: 2,
  0.125: 2,
  0.25: 2,
  0.5: 2,
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6,
  21: 7,
  22: 7,
  23: 7,
  24: 7,
  25: 8,
  26: 8,
  27: 8,
  28: 8,
  29: 9,
  30: 9,
};
/* eslint-enable sort-keys */
