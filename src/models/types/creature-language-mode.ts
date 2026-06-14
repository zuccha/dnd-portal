import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Creature Language Mode
//------------------------------------------------------------------------------

export const creatureLanguageModeSchema = z.enum(["speaks", "understands"]);

export const creatureLanguageModes = creatureLanguageModeSchema.options;

export type CreatureLanguageMode = z.infer<typeof creatureLanguageModeSchema>;

//------------------------------------------------------------------------------
// Creature Language Mode Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useCreatureLanguageModeOptions,
  useTranslate: useTranslateCreatureLanguageMode,
  useTranslations: useCreatureLanguageModeTranslations,
} = createTypeTranslationHooks(creatureLanguageModes, {
  speaks: { en: "Speaks", it: "Parla" },
  understands: { en: "Understands", it: "Comprende" },
});
