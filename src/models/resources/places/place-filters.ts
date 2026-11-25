import z from "zod";
import { placeTypeSchema } from "../../types/place-type";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Place Order Options
//------------------------------------------------------------------------------

export const placeOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Place Filters
//------------------------------------------------------------------------------

export const placeFiltersSchema = resourceFiltersSchema.extend({
  types: z.partialRecord(placeTypeSchema, z.boolean().optional()).optional(),
});

export type PlaceFilters = z.infer<typeof placeFiltersSchema>;

//------------------------------------------------------------------------------
// Default Place Filters
//------------------------------------------------------------------------------

export const defaultPlaceFilters: PlaceFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
