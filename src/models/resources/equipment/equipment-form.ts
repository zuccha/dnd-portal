import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Equipment Form Data Patch
//------------------------------------------------------------------------------

export type EquipmentFormDataPatch = Partial<Omit<Equipment, "kind">>;

//------------------------------------------------------------------------------
// Equipment Form Data
//------------------------------------------------------------------------------

export const equipmentFormDataSchema = resourceFormDataSchema.extend({
  attunement_notes: z.string().default(""),
  cost: z.number().nullable().default(0),
  feature_entries: z.array(featureEntrySchema).default([]),
  magic: z.boolean().default(false),
  modifier_ids: z.array(z.uuid()).default([]),
  notes: z.string().default(""),
  rarity: equipmentRaritySchema.default("common"),
  required_attunement_slots: z.number().default(0),
  weight: z.number().nullable().default(0),
});

export type EquipmentFormData = z.infer<typeof equipmentFormDataSchema>;

//------------------------------------------------------------------------------
// Equipment Form Data To Resource
//------------------------------------------------------------------------------

export function equipmentFormDataToResource(
  data: Partial<EquipmentFormData>,
  lang: string,
): EquipmentFormDataPatch {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    attunement_notes: createResourceFormDataI18nValue(data.attunement_notes, lang),
    cost: data.cost,
    feature_entries: data.feature_entries,
    magic: data.magic,
    modifier_ids: data.modifier_ids,
    notes: createResourceFormDataI18nValue(data.notes, lang),
    rarity: data.rarity,
    required_attunement_slots: data.required_attunement_slots,
    weight: data.weight,
  });
}

//------------------------------------------------------------------------------
// Equipment Form
//------------------------------------------------------------------------------

export const equipmentForm = createForm("equipment", equipmentFormDataSchema.parse);
