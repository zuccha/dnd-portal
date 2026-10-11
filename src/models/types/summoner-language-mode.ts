import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Summoner Language Mode
//------------------------------------------------------------------------------

export const summonerLanguageModeSchema = z.enum(["none", "understands", "speaks"]);

export const summonerLanguageModes = summonerLanguageModeSchema.options;

export type SummonerLanguageMode = z.infer<typeof summonerLanguageModeSchema>;

//------------------------------------------------------------------------------
// Summoner Language Mode Hooks
//------------------------------------------------------------------------------

export const { useOptions: useSummonerLanguageModeOptions } = createTypeTranslationHooks(
  summonerLanguageModes,
  {
    none: {
      en: "Doesn't understand the summoner's language",
      it: "Non comprende le lingue dell'evocatore",
    },
    understands: {
      en: "Understands the summoner's languages",
      it: "Comprende le lingue dell'evocatore",
    },
    speaks: {
      en: "Understands and speaks the summoner's languages",
      it: "Comprende e parla le lingue dell'evocatore",
    },
  },
);
