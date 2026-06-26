import z from "zod";
import type { TranslationFields } from "../../../resource";
import {
  defaultEquipmentModifier,
  equipmentModifierSchema,
  equipmentModifierTranslationFields,
} from "../equipment-modifier";

//------------------------------------------------------------------------------
// Armor Modifier
//------------------------------------------------------------------------------

export const armorModifierSchema = equipmentModifierSchema.extend({});

export type ArmorModifier = z.infer<typeof armorModifierSchema>;

//------------------------------------------------------------------------------
// Default Armor Modifier
//------------------------------------------------------------------------------

export const defaultArmorModifier: ArmorModifier = {
  ...defaultEquipmentModifier,
};

//------------------------------------------------------------------------------
// Armor Modifier Translation Fields
//------------------------------------------------------------------------------

export const armorModifierTranslationFields: TranslationFields<ArmorModifier>[] =
  [...equipmentModifierTranslationFields];
