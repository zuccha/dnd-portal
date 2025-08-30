import { z } from "zod";
import { createTypeTranslation } from "./type-translation";
import { weaponMasteries, weaponMasterySchema } from "./weapon-mastery";

//------------------------------------------------------------------------------
// Weapon Mastery Translation
//------------------------------------------------------------------------------

export const weaponMasteryTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  weapon_mastery: weaponMasterySchema,
});

export type WeaponMasteryTranslation = z.infer<
  typeof weaponMasteryTranslationSchema
>;

//------------------------------------------------------------------------------
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponMastery,
  useTranslations: useWeaponMasteryTranslations,
} = createTypeTranslation(
  "weapon_mastery",
  weaponMasteries,
  weaponMasteryTranslationSchema
);
