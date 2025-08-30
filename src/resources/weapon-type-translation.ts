import { z } from "zod";
import { createTypeTranslation } from "./type-translation";
import { weaponTypeSchema, weaponTypes } from "./weapon-type";

//------------------------------------------------------------------------------
// Weapon Type Translation
//------------------------------------------------------------------------------

export const weaponTypeTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  weapon_type: weaponTypeSchema,
});

export type WeaponTypeTranslation = z.infer<typeof weaponTypeTranslationSchema>;

//------------------------------------------------------------------------------
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponType,
  useTranslations: useWeaponTypeTranslations,
} = createTypeTranslation(
  "weapon_type",
  weaponTypes,
  weaponTypeTranslationSchema
);
