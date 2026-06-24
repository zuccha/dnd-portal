import z from "zod";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import {
  dbResourceSchema,
  dbResourceTranslationSchema,
} from "../../db-resource";

//------------------------------------------------------------------------------
// DB Equipment Modifier
//------------------------------------------------------------------------------

export const dbEquipmentModifierSchema = dbResourceSchema.extend({
  cost_delta: z.number(),
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
  dbResourceTranslationSchema.extend({
    applies_to: z.string().nullish(),
    attunement_notes_delta: z.string().nullish(),
    composite_name: z.string(),
    notes_delta: z.string().nullish(),
  });

export type DBEquipmentModifierTranslation = z.infer<
  typeof dbEquipmentModifierTranslationSchema
>;
