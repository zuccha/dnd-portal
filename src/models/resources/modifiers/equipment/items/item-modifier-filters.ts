import z from "zod";
import {
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "../equipment-modifier-filters";

//------------------------------------------------------------------------------
// Item Modifier Order Options
//------------------------------------------------------------------------------

export const itemModifierOrderOptions = equipmentModifierOrderOptions;

//------------------------------------------------------------------------------
// Item Modifier Filters
//------------------------------------------------------------------------------

export const itemModifierFiltersSchema = equipmentModifierFiltersSchema.extend(
  {},
);

export type ItemModifierFilters = z.infer<typeof itemModifierFiltersSchema>;

//------------------------------------------------------------------------------
// Default Item Modifier Filters
//------------------------------------------------------------------------------

export const defaultItemModifierFilters: ItemModifierFilters = {
  ...defaultEquipmentModifierFilters,
};
