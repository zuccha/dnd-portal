import z from "zod";
import {
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "../equipment-modifier-filters";

//------------------------------------------------------------------------------
// Weapon Modifier Order Options
//------------------------------------------------------------------------------

export const weaponModifierOrderOptions = equipmentModifierOrderOptions;

//------------------------------------------------------------------------------
// Weapon Modifier Filters
//------------------------------------------------------------------------------

export const weaponModifierFiltersSchema =
  equipmentModifierFiltersSchema.extend({});

export type WeaponModifierFilters = z.infer<typeof weaponModifierFiltersSchema>;

//------------------------------------------------------------------------------
// Default Weapon Modifier Filters
//------------------------------------------------------------------------------

export const defaultWeaponModifierFilters: WeaponModifierFilters = {
  ...defaultEquipmentModifierFilters,
};
