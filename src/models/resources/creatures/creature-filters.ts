import { z } from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureTypeSchema } from "../../types/creature-type";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Order Options
//------------------------------------------------------------------------------

export const creatureOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Creature Filters
//------------------------------------------------------------------------------

export const creatureFiltersSchema = resourceFiltersSchema.extend({
  alignment: z.partialRecord(creatureAlignmentSchema, z.boolean().optional()).optional(),
  sizes: z.partialRecord(creatureSizeSchema, z.boolean().optional()).optional(),
  types: z.partialRecord(creatureTypeSchema, z.boolean().optional()).optional(),

  cr_max: z.number(),
  cr_min: z.number(),
});

export type CreatureFilters = z.infer<typeof creatureFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Filters
//------------------------------------------------------------------------------

export const defaultCreatureFilters: CreatureFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",

  alignment: {},
  sizes: {},
  types: {},

  cr_max: 30,
  cr_min: 0,
};
