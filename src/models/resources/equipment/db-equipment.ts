import z from "zod";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Equipment
//------------------------------------------------------------------------------

export const dbEquipmentSchema = dbResourceSchema.extend({
  cost: z.number(),
  magic: z.boolean(),
  weight: z.number(),
});

export type DBEquipment = z.infer<typeof dbEquipmentSchema>;

//------------------------------------------------------------------------------
// DB Equipment Translation
//------------------------------------------------------------------------------

export const dbEquipmentTranslationSchema = dbResourceTranslationSchema.extend({
  notes: z.string().nullish(),
});

export type DBEquipmentTranslation = z.infer<
  typeof dbEquipmentTranslationSchema
>;
