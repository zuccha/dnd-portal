import z from "zod";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import { createForm } from "~/utils/form";
import { createResourceFormDataI18nValue, createResourceFormDataPatch } from "../../resource-form";
import { modifierFormDataSchema, modifierFormDataToResource } from "../modifier-form";
import type { EquipmentModifier } from "./equipment-modifier";

//------------------------------------------------------------------------------
// Equipment Modifier Form Data Patch
//------------------------------------------------------------------------------

export type EquipmentModifierFormDataPatch = Partial<Omit<EquipmentModifier, "kind">>;

//------------------------------------------------------------------------------
// Equipment Modifier Form Data
//------------------------------------------------------------------------------

export const equipmentModifierFormDataSchema = modifierFormDataSchema.extend({
  attunement_notes_delta: z.string().default(""),
  cost_delta: z.number().int().default(0),
  description_delta: z.string().default(""),
  equipment_ids: z.array(z.uuid()).default([]),
  makes_equipment_magic: z.boolean().default(false),
  rarity_minimum: equipmentRaritySchema.default("common"),
  required_attunement_slots_minimum: z.number().int().min(0).default(0),
  weight_delta: z.number().int().default(0),
});

export type EquipmentModifierFormData = z.infer<typeof equipmentModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Equipment Modifier Form Data To Resource
//------------------------------------------------------------------------------

export function equipmentModifierFormDataToResource(
  data: Partial<EquipmentModifierFormData>,
  lang: string,
): EquipmentModifierFormDataPatch {
  return createResourceFormDataPatch({
    ...modifierFormDataToResource(data, lang),
    attunement_notes_delta: createResourceFormDataI18nValue(data.attunement_notes_delta, lang),
    cost_delta: data.cost_delta,
    description_delta: createResourceFormDataI18nValue(data.description_delta, lang),
    equipment_ids: data.equipment_ids,
    makes_equipment_magic: data.makes_equipment_magic,
    rarity_minimum: data.rarity_minimum,
    required_attunement_slots_minimum: data.required_attunement_slots_minimum,
    weight_delta: data.weight_delta,
  });
}

//------------------------------------------------------------------------------
// Equipment Modifier Form
//------------------------------------------------------------------------------

export const equipmentModifierForm = createForm(
  "equipment_modifier",
  equipmentModifierFormDataSchema.parse,
);
