import z from "zod";
import {
  dbEquipmentSchema,
  dbEquipmentTranslationSchema,
} from "../db-equipment";

//------------------------------------------------------------------------------
// DB Item
//------------------------------------------------------------------------------

export const dbItemSchema = dbEquipmentSchema.extend({});

export type DBItem = z.infer<typeof dbItemSchema>;

//------------------------------------------------------------------------------
// DB Item Translation
//------------------------------------------------------------------------------

export const dbItemTranslationSchema = dbEquipmentTranslationSchema.extend({});

export type DBItemTranslation = z.infer<typeof dbItemTranslationSchema>;
