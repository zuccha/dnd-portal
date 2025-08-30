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
// Weapon Property Translation
//------------------------------------------------------------------------------

export const weaponPropertyTranslationSchema = z.object({
  label: z.string().default(""),
  lang: z.string().default("en"),
  weapon_property: weaponPropertySchema,
});

export type WeaponPropertyTranslation = z.infer<
  typeof weaponPropertyTranslationSchema
>;

//------------------------------------------------------------------------------
// Weapon Property Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponProperty,
  useTranslations: useWeaponPropertyTranslations,
} = createTypeTranslationHooks(
  "weapon_property",
  weaponProperties,
  weaponPropertyTranslationSchema
);
