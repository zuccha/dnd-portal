import z from "zod";
import { serviceCategorySchema } from "~/models/types/service-category";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Service Order Options
//------------------------------------------------------------------------------

export const serviceOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Service Filters
//------------------------------------------------------------------------------

export const serviceFiltersSchema = resourceFiltersSchema.extend({
  categories: z
    .partialRecord(serviceCategorySchema, z.boolean().optional())
    .optional(),
});

export type ServiceFilters = z.infer<typeof serviceFiltersSchema>;

//------------------------------------------------------------------------------
// Default Service Filters
//------------------------------------------------------------------------------

export const defaultServiceFilters: ServiceFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
