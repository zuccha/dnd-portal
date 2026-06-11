import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Metamagic Order Options
//------------------------------------------------------------------------------

export const metamagicOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Metamagic Filters
//------------------------------------------------------------------------------

export const metamagicFiltersSchema = resourceFiltersSchema;

export type MetamagicFilters = z.infer<typeof metamagicFiltersSchema>;

//------------------------------------------------------------------------------
// Default Metamagic Filters
//------------------------------------------------------------------------------

export const defaultMetamagicFilters: MetamagicFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};

