import { z } from "zod";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Weapon Property
//------------------------------------------------------------------------------

export const weaponPropertySchema = z.enum([
  "ammunition",
  "finesse",
  "heavy",
  "light",
  "loading",
  "range",
  "reach",
  "throw",
  "two-handed",
  "versatile",
]);

export const weaponProperties = weaponPropertySchema.options;

export type WeaponProperty = z.infer<typeof weaponPropertySchema>;

//------------------------------------------------------------------------------
// Weapon Property Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useWeaponPropertyOptions,
  useTranslate: useTranslateWeaponProperty,
  useTranslations: useWeaponPropertyTranslations,
} = createTypeTranslationHooks(weaponProperties, {
  "ammunition": { en: "Ammunition", it: "Munizioni" },
  "finesse": { en: "Finesse", it: "Accurata" },
  "heavy": { en: "Heavy", it: "Pesante" },
  "light": { en: "Light", it: "Leggera" },
  "loading": { en: "Loading", it: "Ricarica" },
  "range": { en: "Range", it: "Gittata" },
  "reach": { en: "Reach", it: "Portata" },
  "throw": { en: "Throw", it: "Lancio" },
  "two-handed": { en: "Two-Handed", it: "A due mani" },
  "versatile": { en: "Versatile", it: "Versatile" },
});
