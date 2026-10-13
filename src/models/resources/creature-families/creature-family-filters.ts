import { z } from "zod";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Family Order Options
//------------------------------------------------------------------------------

export const creatureFamilyOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Creature Family Filters
//------------------------------------------------------------------------------

export const creatureFamilyFiltersSchema = resourceFiltersSchema;

export type CreatureFamilyFilters = z.infer<typeof creatureFamilyFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Family Filters
//------------------------------------------------------------------------------

export const defaultCreatureFamilyFilters: CreatureFamilyFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
