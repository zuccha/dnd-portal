import z from "zod";
import {
  defaultModifierFilters,
  modifierFiltersSchema,
  modifierOrderOptions,
} from "../modifier-filters";

//------------------------------------------------------------------------------
// Equipment Modifier Order Options
//------------------------------------------------------------------------------

export const equipmentModifierOrderOptions = modifierOrderOptions;

//------------------------------------------------------------------------------
// Equipment Modifier Filters
//------------------------------------------------------------------------------

export const equipmentModifierFiltersSchema = modifierFiltersSchema.extend({});

export type EquipmentModifierFilters = z.infer<
  typeof equipmentModifierFiltersSchema
>;

//------------------------------------------------------------------------------
// Default Equipment Modifier Filters
//------------------------------------------------------------------------------

export const defaultEquipmentModifierFilters: EquipmentModifierFilters = {
  ...defaultModifierFilters,
};
