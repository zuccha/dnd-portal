import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { equipmentRaritySchema } from "~/models/types/equipment-rarity";
import type { TranslationFields } from "../../resource";
import {
  defaultModifier,
  modifierSchema,
  modifierTranslationFields,
} from "../modifier";

//------------------------------------------------------------------------------
// Equipment Modifier
//------------------------------------------------------------------------------

export const equipmentModifierSchema = modifierSchema.extend({
  attunement_notes_delta: i18nStringSchema,
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
  ...defaultModifier,
  attunement_notes_delta: {},
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
  [...modifierTranslationFields, "attunement_notes_delta", "notes_delta"];
