import z from "zod";
import {
  dbEquipmentModifierSchema,
  dbEquipmentModifierTranslationSchema,
} from "../db-equipment-modifier";

//------------------------------------------------------------------------------
// DB Armor Modifier
//------------------------------------------------------------------------------

export const dbArmorModifierSchema = dbEquipmentModifierSchema.extend({});

export type DBArmorModifier = z.infer<typeof dbArmorModifierSchema>;

//------------------------------------------------------------------------------
// DB Armor Modifier Translation
//------------------------------------------------------------------------------

export const dbArmorModifierTranslationSchema =
  dbEquipmentModifierTranslationSchema.extend({});

export type DBArmorModifierTranslation = z.infer<
  typeof dbArmorModifierTranslationSchema
>;
