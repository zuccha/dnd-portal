import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { dbFeatureEntrySchema } from "../features/db-feature";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBEquipment, type DBEquipmentTranslation } from "./db-equipment";

//------------------------------------------------------------------------------
// Equipment Form Data
//------------------------------------------------------------------------------

export const equipmentFormDataSchema = resourceFormDataSchema.extend({
  attunement_notes: z.string().default(""),
  cost: z.number().nullable().default(0),
  feature_entries: z.array(dbFeatureEntrySchema).default([]),
  magic: z.boolean().default(false),
  modifier_ids: z.array(z.uuid()).default([]),
  notes: z.string().default(""),
  rarity: equipmentRaritySchema.default("common"),
  required_attunement_slots: z.number().default(0),
  weight: z.number().nullable().default(0),
});

export type EquipmentFormData = z.infer<typeof equipmentFormDataSchema>;

//------------------------------------------------------------------------------
// Equipment Form Data To DB
//------------------------------------------------------------------------------

export function equipmentFormDataToDB(data: Partial<EquipmentFormData>): {
  resource: Partial<DBEquipment>;
  translation: Partial<DBEquipmentTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      cost: data.cost,
      feature_entries: data.feature_entries,
      magic: data.magic,
      modifier_ids: data.modifier_ids,
      rarity: data.rarity,
      required_attunement_slots: data.required_attunement_slots,
      weight: data.weight,
    },
    translation: {
      ...translation,
      attunement_notes: data.attunement_notes,
      notes: data.notes,
    },
  };
}

//------------------------------------------------------------------------------
// Equipment Form
//------------------------------------------------------------------------------

export const equipmentForm = createForm(
  "equipment",
  equipmentFormDataSchema.parse,
);
