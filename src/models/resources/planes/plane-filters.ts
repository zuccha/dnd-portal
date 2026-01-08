import z from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { planeCategorySchema } from "../../types/plane-category";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Plane Order Options
//------------------------------------------------------------------------------

export const planeOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Plane Filters
//------------------------------------------------------------------------------

export const planeFiltersSchema = resourceFiltersSchema.extend({
  alignments: z
    .partialRecord(creatureAlignmentSchema, z.boolean().optional())
    .optional(),
  categories: z
    .partialRecord(planeCategorySchema, z.boolean().optional())
    .optional(),
});

export type PlaneFilters = z.infer<typeof planeFiltersSchema>;

//------------------------------------------------------------------------------
// Default Plane Filters
//------------------------------------------------------------------------------

export const defaultPlaneFilters: PlaneFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
