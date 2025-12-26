import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Weapon Type
//------------------------------------------------------------------------------

export const weaponTypeSchema = z.enum(["simple", "martial"]);

export const weaponTypes = weaponTypeSchema.options;

export type WeaponType = z.infer<typeof weaponTypeSchema>;

//------------------------------------------------------------------------------
// Weapon Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useWeaponTypeOptions,
  useTranslate: useTranslateWeaponType,
  useTranslations: useWeaponTypeTranslations,
} = createTypeTranslationHooks(weaponTypes, {
  martial: { en: "Martial Weapon", it: "Arma da Guerra" },
  simple: { en: "Simple Weapon", it: "Arma Semplice" },
});
