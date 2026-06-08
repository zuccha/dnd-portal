import z from "zod";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Species Order Options
//------------------------------------------------------------------------------

export const speciesOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Species Filters
//------------------------------------------------------------------------------

export const speciesFiltersSchema = resourceFiltersSchema.extend({
  sizes: z.partialRecord(creatureSizeSchema, z.boolean().optional()).optional(),
  types: z.partialRecord(creatureTypeSchema, z.boolean().optional()).optional(),
});

export type SpeciesFilters = z.infer<typeof speciesFiltersSchema>;

//------------------------------------------------------------------------------
// Default Species Filters
//------------------------------------------------------------------------------

export const defaultSpeciesFilters: SpeciesFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
