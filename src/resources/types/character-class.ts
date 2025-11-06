import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Character Class
//------------------------------------------------------------------------------

export const characterClassSchema = z.enum([
  "artificer",
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
]);

export const characterClasses = characterClassSchema.options;

export type CharacterClass = z.infer<typeof characterClassSchema>;

//------------------------------------------------------------------------------
// Character Class Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useCharacterClassOptions,
  useTranslate: useTranslateCharacterClass,
  useTranslations: useCharacterClassTranslations,
} = createTypeTranslationHooks(
  characterClasses,
  {
    artificer: { en: "Artificer", it: "Artificiere" },
    barbarian: { en: "Barbarian", it: "Barbaro" },
    bard: { en: "Bard", it: "Bardo" },
    cleric: { en: "Cleric", it: "Chierico" },
    druid: { en: "Druid", it: "Druido" },
    fighter: { en: "Fighter", it: "Guerriero" },
    monk: { en: "Monk", it: "Monaco" },
    paladin: { en: "Paladin", it: "Paladino" },
    ranger: { en: "Ranger", it: "Ranger" },
    rogue: { en: "Rogue", it: "Ladro" },
    sorcerer: { en: "Sorcerer", it: "Stregone" },
    warlock: { en: "Warlock", it: "Warlock" },
    wizard: { en: "Wizard", it: "Mago" },
  },
  {
    artificer: { en: "Art.", it: "Art." },
    barbarian: { en: "Brb.", it: "Brb." },
    bard: { en: "Brd.", it: "Brd." },
    cleric: { en: "Cle.", it: "Chi." },
    druid: { en: "Dru.", it: "Dru." },
    fighter: { en: "Fig.", it: "Gue." },
    monk: { en: "Mon.", it: "Mon." },
    paladin: { en: "Pal.", it: "Pal." },
    ranger: { en: "Ran.", it: "Ran." },
    rogue: { en: "Rog.", it: "Lad." },
    sorcerer: { en: "Sor.", it: "Str." },
    warlock: { en: "War.", it: "War." },
    wizard: { en: "Wiz.", it: "Mag." },
  }
);
