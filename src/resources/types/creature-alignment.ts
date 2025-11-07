import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Alignment
//------------------------------------------------------------------------------

export const creatureAlignmentSchema = z.enum([
  "lawful_good",
  "neutral_good",
  "chaotic_good",
  "lawful_neutral",
  "true_neutral",
  "chaotic_neutral",
  "lawful_evil",
  "neutral_evil",
  "chaotic_evil",
  "unaligned",
]);

export const creatureAlignments = creatureAlignmentSchema.options;

export type CreatureAlignment = z.infer<typeof creatureAlignmentSchema>;

//------------------------------------------------------------------------------
// Creature Alignment Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateCreatureAlignment,
  useTranslations: useCreatureAlignmentTranslations,
} = createTypeTranslationHooks(creatureAlignments, {
  chaotic_evil: { en: "Chaotic Evil", it: "Caotico Malvagio" },
  chaotic_good: { en: "Chaotic Good", it: "Caotico Buono" },
  chaotic_neutral: { en: "Chaotic Neutral", it: "Caotico Neutrale" },
  lawful_evil: { en: "Lawful Evil", it: "Legale Malvagio" },
  lawful_good: { en: "Lawful Good", it: "Legale Buono" },
  lawful_neutral: { en: "Lawful Neutral", it: "Legale Neutrale" },
  neutral_evil: { en: "Neutral Evil", it: "Neutrale Malvagio" },
  neutral_good: { en: "Neutral Good", it: "Neutrale Buono" },
  true_neutral: { en: "Neutral", it: "Neutrale" },
  unaligned: { en: "Unaligned", it: "Senza Allineamento" },
});
