import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Background Order Options
//------------------------------------------------------------------------------

export const backgroundOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Background Filters
//------------------------------------------------------------------------------

export const backgroundFiltersSchema = resourceFiltersSchema;

export type BackgroundFilters = z.infer<typeof backgroundFiltersSchema>;

//------------------------------------------------------------------------------
// Default Background Filters
//------------------------------------------------------------------------------

export const defaultBackgroundFilters: BackgroundFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};

