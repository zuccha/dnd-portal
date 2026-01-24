import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Tag Order Options
//------------------------------------------------------------------------------

export const creatureTagOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Creature Tag Filters
//------------------------------------------------------------------------------

export const creatureTagFiltersSchema = resourceFiltersSchema.extend({});

export type CreatureTagFilters = z.infer<typeof creatureTagFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Tag Filters
//------------------------------------------------------------------------------

export const defaultCreatureTagFilters: CreatureTagFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
