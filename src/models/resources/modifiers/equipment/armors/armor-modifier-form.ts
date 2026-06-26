import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentModifierFormDataSchema,
  equipmentModifierFormDataToDB,
} from "../equipment-modifier-form";
import type {
  DBArmorModifier,
  DBArmorModifierTranslation,
} from "./db-armor-modifier";

//------------------------------------------------------------------------------
// Armor Modifier Form Data
//------------------------------------------------------------------------------

export const armorModifierFormDataSchema =
  equipmentModifierFormDataSchema.extend({});

export type ArmorModifierFormData = z.infer<typeof armorModifierFormDataSchema>;

//------------------------------------------------------------------------------
// Armor Modifier Form Data To DB
//------------------------------------------------------------------------------

export function armorModifierFormDataToDB(
  data: Partial<ArmorModifierFormData>,
): {
  resource: Partial<DBArmorModifier>;
  translation: Partial<DBArmorModifierTranslation>;
} {
  return equipmentModifierFormDataToDB(data);
}

//------------------------------------------------------------------------------
// Armor Modifier Form
//------------------------------------------------------------------------------

export const armorModifierForm = createForm(
  "armor_modifier",
  armorModifierFormDataSchema.parse,
);
