import z from "zod";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Character Subclass Order Options
//------------------------------------------------------------------------------

export const characterSubclassOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Character Subclass Filters
//------------------------------------------------------------------------------

export const characterSubclassFiltersSchema = resourceFiltersSchema.extend({
  character_class_ids: z
    .partialRecord(z.uuid(), z.boolean().optional())
    .optional(),
});

export type CharacterSubclassFilters = z.infer<
  typeof characterSubclassFiltersSchema
>;

//------------------------------------------------------------------------------
// Default Character Subclass Filters
//------------------------------------------------------------------------------

export const defaultCharacterSubclassFilters: CharacterSubclassFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
