import z from "zod";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import { createForm } from "~/utils/form";
import { modifierFormDataSchema, modifierFormDataToDB } from "../modifier-form";
import type {
  DBEquipmentModifier,
  DBEquipmentModifierTranslation,
} from "./db-equipment-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Form Data
//------------------------------------------------------------------------------

export const equipmentModifierFormDataSchema = modifierFormDataSchema.extend({
  attunement_notes_delta: z.string().default(""),
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
  const { resource, translation } = modifierFormDataToDB(data);

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
      attunement_notes_delta: data.attunement_notes_delta,
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
