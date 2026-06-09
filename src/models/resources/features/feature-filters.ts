import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Feature Order Options
//------------------------------------------------------------------------------

export const featureOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Feature Filters
//------------------------------------------------------------------------------

export const featureFiltersSchema = resourceFiltersSchema;

export type FeatureFilters = z.infer<typeof featureFiltersSchema>;

//------------------------------------------------------------------------------
// Default Feature Filters
//------------------------------------------------------------------------------

export const defaultFeatureFilters: FeatureFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
