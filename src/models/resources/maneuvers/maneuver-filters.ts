import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Maneuver Order Options
//------------------------------------------------------------------------------

export const maneuverOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Maneuver Filters
//------------------------------------------------------------------------------

export const maneuverFiltersSchema = resourceFiltersSchema;

export type ManeuverFilters = z.infer<typeof maneuverFiltersSchema>;

//------------------------------------------------------------------------------
// Default Maneuver Filters
//------------------------------------------------------------------------------

export const defaultManeuverFilters: ManeuverFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
