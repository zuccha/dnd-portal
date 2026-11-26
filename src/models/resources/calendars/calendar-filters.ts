import z from "zod";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Calendar Order Options
//------------------------------------------------------------------------------

export const calendarOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Calendar Filters Schema
//------------------------------------------------------------------------------

export const calendarFiltersSchema = resourceFiltersSchema;

//------------------------------------------------------------------------------
// Calendar Filters Type
//------------------------------------------------------------------------------

export type CalendarFilters = z.infer<typeof calendarFiltersSchema>;

//------------------------------------------------------------------------------
// Default Calendar Filters
//------------------------------------------------------------------------------

export const defaultCalendarFilters: CalendarFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
