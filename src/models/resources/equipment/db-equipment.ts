import z from "zod";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";
import { dbFeatureEntrySchema } from "../features/db-feature";

//------------------------------------------------------------------------------
// DB Equipment
//------------------------------------------------------------------------------

export const dbEquipmentSchema = dbResourceSchema.extend({
  cost: z.number(),
  feature_entries: z.array(dbFeatureEntrySchema),
  magic: z.boolean(),
  rarity: equipmentRaritySchema,
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
