import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  createRelationEndpointUpdates,
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
  const { feature_entries, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    attunement_notes: createResourceFormDataI18nValue(data.attunement_notes, lang),
    cost: data.cost,
    magic: data.magic,
    modifier_ids: data.modifier_ids,
    notes: createResourceFormDataI18nValue(data.notes, lang),
    rarity: data.rarity,
    required_attunement_slots: data.required_attunement_slots,
    weight: data.weight,
  });
  const relations = createRelationEndpointUpdates("equipments_and_features", feature_entries);
  return { resource, relations };
}

//------------------------------------------------------------------------------
// Equipment Form
//------------------------------------------------------------------------------

export const equipmentForm = createForm("equipment", equipmentFormDataSchema.parse);
