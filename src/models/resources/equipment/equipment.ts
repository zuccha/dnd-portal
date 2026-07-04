import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import { dbFeatureEntrySchema } from "../features/db-feature";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Equipment
//------------------------------------------------------------------------------

export const equipmentSchema = resourceSchema.extend({
  attunement_notes: i18nStringSchema,
  cost: z.number().nullable(),
  feature_entries: z.array(dbFeatureEntrySchema),
  kind: z.enum(["equipment", "armor", "item", "tool", "weapon"]),
  magic: z.boolean(),
  modifier_ids: z.array(z.uuid()),
  notes: i18nStringSchema,
  rarity: equipmentRaritySchema,
  required_attunement_slots: z.number(),
  variant_base_id: z.uuid().nullish(),
  variant_modifier_ids: z.array(z.uuid()).default([]),
  weight: z.number().nullable(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

//------------------------------------------------------------------------------
// Default Equipment
//------------------------------------------------------------------------------

export const defaultEquipment: Equipment = {
  ...defaultResource,
  attunement_notes: {},
  cost: 0,
  feature_entries: [],
  kind: "equipment",
  magic: false,
  modifier_ids: [],
  notes: {},
  rarity: "common",
  required_attunement_slots: 0,
  variant_base_id: undefined,
  variant_modifier_ids: [],
  weight: 0,
};

//------------------------------------------------------------------------------
// Equipment Translation Fields
//------------------------------------------------------------------------------

export const equipmentTranslationFields: TranslationFields<Equipment>[] = [
  ...resourceTranslationFields,
  "attunement_notes",
  "notes",
];
