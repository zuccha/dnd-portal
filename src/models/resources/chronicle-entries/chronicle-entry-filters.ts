import z from "zod";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Chronicle Entry Order Options
//------------------------------------------------------------------------------

export const chronicleEntryOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Chronicle Entry Filters
//------------------------------------------------------------------------------

export const chronicleEntryFiltersSchema = resourceFiltersSchema.extend({
  date_max: chronicleDateSchema.nullable().default(null),
  date_min: chronicleDateSchema.nullable().default(null),
});

export type ChronicleEntryFilters = z.infer<typeof chronicleEntryFiltersSchema>;

//------------------------------------------------------------------------------
// Default Chronicle Entry Filters
//------------------------------------------------------------------------------

export const defaultChronicleEntryFilters: ChronicleEntryFilters = {
  date_max: null,
  date_min: null,
  name: "",
  order_by: "name",
  order_dir: "asc",
};
