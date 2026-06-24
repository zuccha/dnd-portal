import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../../resource-filters";

//------------------------------------------------------------------------------
// Equipment Modifier Order Options
//------------------------------------------------------------------------------

export const equipmentModifierOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Equipment Modifier Filters
//------------------------------------------------------------------------------

export const equipmentModifierFiltersSchema = resourceFiltersSchema;

export type EquipmentModifierFilters = z.infer<
  typeof equipmentModifierFiltersSchema
>;

//------------------------------------------------------------------------------
// Default Equipment Modifier Filters
//------------------------------------------------------------------------------

export const defaultEquipmentModifierFilters: EquipmentModifierFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
