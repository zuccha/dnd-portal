import z from "zod";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Habitat Order Options
//------------------------------------------------------------------------------

export const creatureHabitatOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Creature Habitat Filters
//------------------------------------------------------------------------------

export const creatureHabitatFiltersSchema = resourceFiltersSchema;

export type CreatureHabitatFilters = z.infer<typeof creatureHabitatFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Habitat Filters
//------------------------------------------------------------------------------

export const defaultCreatureHabitatFilters: CreatureHabitatFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
