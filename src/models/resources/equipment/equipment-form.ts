import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBEquipment, type DBEquipmentTranslation } from "./db-equipment";

//------------------------------------------------------------------------------
// Equipment Form Data
//------------------------------------------------------------------------------

export const equipmentFormDataSchema = resourceFormDataSchema.extend({
  cost: z.number(),
  magic: z.boolean(),
  notes: z.string(),
  rarity: equipmentRaritySchema,
  weight: z.number(),
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
      magic: data.magic,
      rarity: data.rarity,
      weight: data.weight,
    },
    translation: {
      ...translation,
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
