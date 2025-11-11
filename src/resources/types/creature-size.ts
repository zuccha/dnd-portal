import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Size
//------------------------------------------------------------------------------

export const creatureSizeSchema = z.enum([
  "tiny",
  "small",
  "medium",
  "large",
  "huge",
  "gargantuan",
]);

export const creatureSizes = creatureSizeSchema.options;

export type CreatureSize = z.infer<typeof creatureSizeSchema>;

//------------------------------------------------------------------------------
// Creature Size Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useCreatureSizeOptions,
  useTranslate: useTranslateCreatureSize,
  useTranslations: useCreatureSizeTranslations,
} = createTypeTranslationHooks(creatureSizes, {
  gargantuan: { en: "Gargantuan", it: "Mastodontico" },
  huge: { en: "Huge", it: "Enorme" },
  large: { en: "Large", it: "Grande" },
  medium: { en: "Medium", it: "Medio" },
  small: { en: "Small", it: "Piccolo" },
  tiny: { en: "Tiny", it: "Minuscolo" },
});
