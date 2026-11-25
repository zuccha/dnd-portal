import z from "zod";
import { factionTypeSchema } from "../../types/faction-type";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Faction Order Options
//------------------------------------------------------------------------------

export const factionOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Faction Filters
//------------------------------------------------------------------------------

export const factionFiltersSchema = resourceFiltersSchema.extend({
  types: z.partialRecord(factionTypeSchema, z.boolean().optional()).optional(),
});

//------------------------------------------------------------------------------
// Faction Filters Type
//------------------------------------------------------------------------------

export type FactionFilters = z.infer<typeof factionFiltersSchema>;

//------------------------------------------------------------------------------
// Default Faction Filters
//------------------------------------------------------------------------------

export const defaultFactionFilters: FactionFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
