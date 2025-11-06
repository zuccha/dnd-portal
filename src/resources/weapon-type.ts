import { z } from "zod";
import { createTypeTranslationHooks } from "./type";

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
  martial: { en: "Martial", it: "Da Guerra" },
  simple: { en: "Simple", it: "Semplice" },
});
