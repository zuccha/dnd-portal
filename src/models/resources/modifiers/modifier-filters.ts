import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Modifier Order Options
//------------------------------------------------------------------------------

export const modifierOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Modifier Filters
//------------------------------------------------------------------------------

export const modifierFiltersSchema = resourceFiltersSchema;

export type ModifierFilters = z.infer<typeof modifierFiltersSchema>;

//------------------------------------------------------------------------------
// Default Modifier Filters
//------------------------------------------------------------------------------

export const defaultModifierFilters: ModifierFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
