import z from "zod";
import { itemTypeSchema } from "../../../types/item-type";
import {
  dbEquipmentSchema,
  dbEquipmentTranslationSchema,
} from "../db-equipment";

//------------------------------------------------------------------------------
// DB Item
//------------------------------------------------------------------------------

export const dbItemSchema = dbEquipmentSchema.extend({
  charges: z.number().nullable(),
  consumable: z.boolean(),
  type: itemTypeSchema,
});

export type DBItem = z.infer<typeof dbItemSchema>;

//------------------------------------------------------------------------------
// DB Item Translation
//------------------------------------------------------------------------------

export const dbItemTranslationSchema = dbEquipmentTranslationSchema.extend({});

export type DBItemTranslation = z.infer<typeof dbItemTranslationSchema>;
