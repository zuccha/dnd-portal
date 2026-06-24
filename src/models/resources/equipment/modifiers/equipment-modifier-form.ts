import z from "zod";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import { createForm } from "~/utils/form";
import {
  resourceFormDataSchema,
  resourceFormDataToDB,
} from "../../resource-form";
import type {
  DBEquipmentModifier,
  DBEquipmentModifierTranslation,
} from "./db-equipment-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Form Data
//------------------------------------------------------------------------------

export const equipmentModifierFormDataSchema = resourceFormDataSchema.extend({
  applies_to: z.string().default(""),
  attunement_notes_delta: z.string().default(""),
  composite_name: z.string().default("{base}"),
  cost_delta: z.number().int().default(0),
  equipment_ids: z.array(z.uuid()).default([]),
  make_magic: z.boolean().default(false),
  notes_delta: z.string().default(""),
  rarity_minimum: equipmentRaritySchema.default("common"),
  required_attunement_slots_minimum: z.number().int().min(0).default(0),
  weight_delta: z.number().int().default(0),
});

export type EquipmentModifierFormData = z.infer<
  typeof equipmentModifierFormDataSchema
>;

//------------------------------------------------------------------------------
// Equipment Modifier Form Data To DB
//------------------------------------------------------------------------------

export function equipmentModifierFormDataToDB(
  data: Partial<EquipmentModifierFormData>,
): {
  resource: Partial<DBEquipmentModifier>;
  translation: Partial<DBEquipmentModifierTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      cost_delta: data.cost_delta,
      equipment_ids: data.equipment_ids,
      make_magic: data.make_magic,
      rarity_minimum: data.rarity_minimum,
      required_attunement_slots_minimum: data.required_attunement_slots_minimum,
      weight_delta: data.weight_delta,
    },
    translation: {
      ...translation,
      applies_to: data.applies_to,
      attunement_notes_delta: data.attunement_notes_delta,
      composite_name: data.composite_name,
      notes_delta: data.notes_delta,
    },
  };
}

//------------------------------------------------------------------------------
// Equipment Modifier Form
//------------------------------------------------------------------------------

export const equipmentModifierForm = createForm(
  "equipment_modifier",
  equipmentModifierFormDataSchema.parse,
);
