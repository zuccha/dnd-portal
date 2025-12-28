import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Eldritch Invocation Order Options
//------------------------------------------------------------------------------

export const eldritchInvocationOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Eldritch Invocation Filters
//------------------------------------------------------------------------------

export const eldritchInvocationFiltersSchema = resourceFiltersSchema.extend({
  warlock_level: z.number().optional(),
});

export type EldritchInvocationFilters = z.infer<
  typeof eldritchInvocationFiltersSchema
>;

//------------------------------------------------------------------------------
// Default Eldritch Invocation Filters
//------------------------------------------------------------------------------

export const defaultEldritchInvocationFilters: EldritchInvocationFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
