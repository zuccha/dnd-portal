import z from "zod";
import { relicTypeSchema } from "../../types/relic-type";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Relic Order Options
//------------------------------------------------------------------------------

export const relicOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Relic Filters
//------------------------------------------------------------------------------

export const relicFiltersSchema = resourceFiltersSchema.extend({
  types: z.partialRecord(relicTypeSchema, z.boolean().optional()).optional(),
});

//------------------------------------------------------------------------------
// Relic Filters Type
//------------------------------------------------------------------------------

export type RelicFilters = z.infer<typeof relicFiltersSchema>;

//------------------------------------------------------------------------------
// Default Relic Filters
//------------------------------------------------------------------------------

export const defaultRelicFilters: RelicFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
