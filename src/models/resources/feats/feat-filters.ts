import z from "zod";
import { featCategorySchema } from "../../types/feat-category";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Feat Order Options
//------------------------------------------------------------------------------

export const featOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Feat Filters
//------------------------------------------------------------------------------

export const featFiltersSchema = resourceFiltersSchema.extend({
  categories: z
    .partialRecord(featCategorySchema, z.boolean().optional())
    .optional(),
  level: z.number().default(20),
});

export type FeatFilters = z.infer<typeof featFiltersSchema>;

//------------------------------------------------------------------------------
// Default Feat Filters
//------------------------------------------------------------------------------

export const defaultFeatFilters: FeatFilters = {
  level: 20,
  name: "",
  order_by: "name",
  order_dir: "asc",
};
