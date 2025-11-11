import { z } from "zod";
import { createTypeTranslationHooks } from "../type";

//------------------------------------------------------------------------------
// Creature Ability
//------------------------------------------------------------------------------

export const creatureAbilitySchema = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);

export const creatureAbilities = creatureAbilitySchema.options;

export type CreatureAbility = z.infer<typeof creatureAbilitySchema>;

//------------------------------------------------------------------------------
// Creature Ability Hooks
//------------------------------------------------------------------------------

export const {
  useOptions: useCreatureAbilityOptions,
  useTranslate: useTranslateCreatureAbility,
  useTranslations: useCreatureAbilityTranslations,
} = createTypeTranslationHooks(
  creatureAbilities,
  {
    charisma: { en: "Charisma", it: "Carisma" },
    constitution: { en: "Constitution", it: "Costituzione" },
    dexterity: { en: "Dexterity", it: "Destrezza" },
    intelligence: { en: "Intelligence", it: "Intelligenza" },
    strength: { en: "Strength", it: "Forza" },
    wisdom: { en: "Wisdom", it: "Saggezza" },
  },
  {
    charisma: { en: "Cha", it: "Car" },
    constitution: { en: "Con", it: "Cos" },
    dexterity: { en: "Dex", it: "Des" },
    intelligence: { en: "Int", it: "Int" },
    strength: { en: "Str", it: "For" },
    wisdom: { en: "Wis", it: "Sag" },
  },
);
