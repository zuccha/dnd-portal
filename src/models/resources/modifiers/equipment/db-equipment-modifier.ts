import z from "zod";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import { dbModifierSchema, dbModifierTranslationSchema } from "../db-modifier";

//------------------------------------------------------------------------------
// DB Equipment Modifier
//------------------------------------------------------------------------------

export const dbEquipmentModifierSchema = dbModifierSchema.extend({
  cost_delta: z.number(),
  equipment_ids: z.array(z.uuid()),
  make_magic: z.boolean(),
  rarity_minimum: equipmentRaritySchema,
  required_attunement_slots_minimum: z.number(),
  weight_delta: z.number(),
});

export type DBEquipmentModifier = z.infer<typeof dbEquipmentModifierSchema>;

//------------------------------------------------------------------------------
// DB Equipment Modifier Translation
//------------------------------------------------------------------------------

export const dbEquipmentModifierTranslationSchema =
  dbModifierTranslationSchema.extend({
    attunement_notes_delta: z.string().nullish(),
    notes_delta: z.string().nullish(),
  });

export type DBEquipmentModifierTranslation = z.infer<
  typeof dbEquipmentModifierTranslationSchema
>;
