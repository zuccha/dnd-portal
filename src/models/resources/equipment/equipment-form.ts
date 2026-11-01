import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { RelationEndpointUpdate } from "../../catalogue/resource-relations";
import type { Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Equipment Form Data Patch
//------------------------------------------------------------------------------

export type EquipmentFormDataPatch = {
  relations: RelationEndpointUpdate[];
  resource: Partial<Omit<Equipment, "kind">>;
};

//------------------------------------------------------------------------------
// Equipment Form Data
//------------------------------------------------------------------------------

export const equipmentFormDataSchema = resourceFormDataSchema.extend({
  attunement_notes: z.string().default(""),
  cost: z.number().nullable().default(0),
  description: z.string().default(""),
  is_magic: z.boolean().default(false),
  modifier_ids: z.array(z.uuid()).default([]),
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
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    attunement_notes: createResourceFormDataI18nValue(data.attunement_notes, lang),
    cost: data.cost,
    description: createResourceFormDataI18nValue(data.description, lang),
    is_magic: data.is_magic,
    modifier_ids: data.modifier_ids,
    rarity: data.rarity,
    required_attunement_slots: data.required_attunement_slots,
    weight: data.weight,
  });
  return { resource, relations: [] };
}

//------------------------------------------------------------------------------
// Equipment Form
//------------------------------------------------------------------------------

export const equipmentForm = createForm("equipment", equipmentFormDataSchema.parse);
