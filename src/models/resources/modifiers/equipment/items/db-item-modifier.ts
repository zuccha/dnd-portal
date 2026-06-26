import z from "zod";
import {
  dbEquipmentModifierSchema,
  dbEquipmentModifierTranslationSchema,
} from "../db-equipment-modifier";

//------------------------------------------------------------------------------
// DB Item Modifier
//------------------------------------------------------------------------------

export const dbItemModifierSchema = dbEquipmentModifierSchema.extend({});

export type DBItemModifier = z.infer<typeof dbItemModifierSchema>;

//------------------------------------------------------------------------------
// DB Item Modifier Translation
//------------------------------------------------------------------------------

export const dbItemModifierTranslationSchema =
  dbEquipmentModifierTranslationSchema.extend({});

export type DBItemModifierTranslation = z.infer<
  typeof dbItemModifierTranslationSchema
>;
