import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Character Class Order Options
//------------------------------------------------------------------------------

export const characterClassOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Character Class Filters
//------------------------------------------------------------------------------

export const characterClassFiltersSchema = resourceFiltersSchema.extend({});

export type CharacterClassFilters = z.infer<typeof characterClassFiltersSchema>;

//------------------------------------------------------------------------------
// Default Character Class Filters
//------------------------------------------------------------------------------

export const defaultCharacterClassFilters: CharacterClassFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
