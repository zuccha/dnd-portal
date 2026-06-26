import z from "zod";
import {
  defaultEquipmentModifierFilters,
  equipmentModifierFiltersSchema,
  equipmentModifierOrderOptions,
} from "../equipment-modifier-filters";

//------------------------------------------------------------------------------
// Tool Modifier Order Options
//------------------------------------------------------------------------------

export const toolModifierOrderOptions = equipmentModifierOrderOptions;

//------------------------------------------------------------------------------
// Tool Modifier Filters
//------------------------------------------------------------------------------

export const toolModifierFiltersSchema = equipmentModifierFiltersSchema.extend(
  {},
);

export type ToolModifierFilters = z.infer<typeof toolModifierFiltersSchema>;

//------------------------------------------------------------------------------
// Default Tool Modifier Filters
//------------------------------------------------------------------------------

export const defaultToolModifierFilters: ToolModifierFilters = {
  ...defaultEquipmentModifierFilters,
};
