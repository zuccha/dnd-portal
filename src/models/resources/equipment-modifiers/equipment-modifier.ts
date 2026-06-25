import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Equipment Modifier
//------------------------------------------------------------------------------

export const equipmentModifierSchema = resourceSchema.extend({
  applies_to: i18nStringSchema,
  attunement_notes_delta: i18nStringSchema,
  composite_name: i18nStringSchema,
  cost_delta: z.number(),
  equipment_ids: z.array(z.uuid()),
  make_magic: z.boolean(),
  notes_delta: i18nStringSchema,
  rarity_minimum: equipmentRaritySchema,
  required_attunement_slots_minimum: z.number(),
  weight_delta: z.number(),
});

export type EquipmentModifier = z.infer<typeof equipmentModifierSchema>;

//------------------------------------------------------------------------------
// Default Equipment Modifier
//------------------------------------------------------------------------------

export const defaultEquipmentModifier: EquipmentModifier = {
  ...defaultResource,
  applies_to: {},
  attunement_notes_delta: {},
  composite_name: { en: "{base}", it: "{base}" },
  cost_delta: 0,
  equipment_ids: [],
  make_magic: false,
  notes_delta: {},
  rarity_minimum: "common",
  required_attunement_slots_minimum: 0,
  weight_delta: 0,
};

//------------------------------------------------------------------------------
// Equipment Modifier Translation Fields
//------------------------------------------------------------------------------

export const equipmentModifierTranslationFields: TranslationFields<EquipmentModifier>[] =
  [
    ...resourceTranslationFields,
    "applies_to",
    "attunement_notes_delta",
    "composite_name",
    "notes_delta",
  ];
