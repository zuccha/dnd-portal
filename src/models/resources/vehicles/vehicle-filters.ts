import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Vehicle Order Options
//------------------------------------------------------------------------------

export const vehicleOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Vehicle Filters
//------------------------------------------------------------------------------

export const defaultVehicleFilters: VehicleFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};

export const vehicleFiltersSchema = resourceFiltersSchema;

export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;
