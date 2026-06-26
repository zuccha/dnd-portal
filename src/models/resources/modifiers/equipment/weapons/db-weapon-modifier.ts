import z from "zod";
import {
  dbEquipmentModifierSchema,
  dbEquipmentModifierTranslationSchema,
} from "../db-equipment-modifier";

//------------------------------------------------------------------------------
// DB Weapon Modifier
//------------------------------------------------------------------------------

export const dbWeaponModifierSchema = dbEquipmentModifierSchema.extend({});

export type DBWeaponModifier = z.infer<typeof dbWeaponModifierSchema>;

//------------------------------------------------------------------------------
// DB Weapon Modifier Translation
//------------------------------------------------------------------------------

export const dbWeaponModifierTranslationSchema =
  dbEquipmentModifierTranslationSchema.extend({});

export type DBWeaponModifierTranslation = z.infer<
  typeof dbWeaponModifierTranslationSchema
>;
