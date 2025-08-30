import { z } from "zod";
import { createTypeTranslationHooks } from "./type";

//------------------------------------------------------------------------------
// Weapon Type
//------------------------------------------------------------------------------

export const weaponTypeSchema = z.enum(["simple", "martial"]);

export const weaponTypes = weaponTypeSchema.options;

export type WeaponType = z.infer<typeof weaponTypeSchema>;

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
// Weapon Type Translation Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponType,
  useTranslations: useWeaponTypeTranslations,
} = createTypeTranslationHooks(
  "weapon_type",
  weaponTypes,
  weaponTypeTranslationSchema
);
