import { z } from "zod";
import { createTypeTranslation } from "./type-translation";
import { weaponProperties, weaponPropertySchema } from "./weapon-property";

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
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateWeaponProperty,
  useTranslations: useWeaponPropertyTranslations,
} = createTypeTranslation(
  "weapon_property",
  weaponProperties,
  weaponPropertyTranslationSchema
);
