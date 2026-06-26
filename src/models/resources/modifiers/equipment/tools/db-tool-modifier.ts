import z from "zod";
import {
  dbEquipmentModifierSchema,
  dbEquipmentModifierTranslationSchema,
} from "../db-equipment-modifier";

//------------------------------------------------------------------------------
// DB Tool Modifier
//------------------------------------------------------------------------------

export const dbToolModifierSchema = dbEquipmentModifierSchema.extend({});

export type DBToolModifier = z.infer<typeof dbToolModifierSchema>;

//------------------------------------------------------------------------------
// DB Tool Modifier Translation
//------------------------------------------------------------------------------

export const dbToolModifierTranslationSchema =
  dbEquipmentModifierTranslationSchema.extend({});

export type DBToolModifierTranslation = z.infer<
  typeof dbToolModifierTranslationSchema
>;
