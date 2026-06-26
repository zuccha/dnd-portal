import z from "zod";
import {
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "../equipment-modifier-filters";

//------------------------------------------------------------------------------
// Armor Modifier Order Options
//------------------------------------------------------------------------------

export const armorModifierOrderOptions = equipmentModifierOrderOptions;

//------------------------------------------------------------------------------
// Armor Modifier Filters
//------------------------------------------------------------------------------

export const armorModifierFiltersSchema = equipmentModifierFiltersSchema.extend(
  {},
);

export type ArmorModifierFilters = z.infer<typeof armorModifierFiltersSchema>;

//------------------------------------------------------------------------------
// Default Armor Modifier Filters
//------------------------------------------------------------------------------

export const defaultArmorModifierFilters: ArmorModifierFilters = {
  ...defaultEquipmentModifierFilters,
};
