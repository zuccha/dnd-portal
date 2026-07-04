import z from "zod";
import {
  localizedEquipmentModifierSchema,
  useLocalizeEquipmentModifier,
} from "../localized-equipment-modifier";
import { type ArmorModifier, armorModifierSchema } from "./armor-modifier";

//------------------------------------------------------------------------------
// Localized Armor Modifier
//------------------------------------------------------------------------------

export const localizedArmorModifierSchema = localizedEquipmentModifierSchema(
  armorModifierSchema,
  z.literal("armor_modifier"),
).extend({});

export type LocalizedArmorModifier = z.infer<
  typeof localizedArmorModifierSchema
>;

//------------------------------------------------------------------------------
// Use Localize Armor Modifier
//------------------------------------------------------------------------------

export function useLocalizeArmorModifier() {
  return useLocalizeEquipmentModifier<ArmorModifier>();
}
