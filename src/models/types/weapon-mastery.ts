import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Weapon Mastery
//------------------------------------------------------------------------------

export const weaponMasterySchema = z.enum([
  "cleave",
  "graze",
  "nick",
  "push",
  "sap",
  "slow",
  "topple",
  "vex",
]);

export const weaponMasteries = weaponMasterySchema.options;

export type WeaponMastery = z.infer<typeof weaponMasterySchema>;

//------------------------------------------------------------------------------
// Weapon Mastery Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useWeaponMasteryOptions,
  useTranslate: useTranslateWeaponMastery,
  useTranslations: useWeaponMasteryTranslations,
} = createTypeTranslationHooks(weaponMasteries, {
  cleave: { en: "Cleave", it: "Doppio fendente" },
  graze: { en: "Graze", it: "Colpo di striscio" },
  nick: { en: "Nick", it: "Graffio" },
  push: { en: "Push", it: "Spinta" },
  sap: { en: "Sap", it: "Prosciugamento" },
  slow: { en: "Slow", it: "Lentezza" },
  topple: { en: "Topple", it: "Rovesciamento" },
  vex: { en: "Vex", it: "Vessazione" },
});
