import z from "zod";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Creature Treasure Order Options
//------------------------------------------------------------------------------

export const creatureTreasureOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Creature Treasure Filters Schema
//------------------------------------------------------------------------------

export const creatureTreasureFiltersSchema = resourceFiltersSchema;

//------------------------------------------------------------------------------
// Creature Treasure Filters
//------------------------------------------------------------------------------

export type CreatureTreasureFilters = z.infer<typeof creatureTreasureFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature Treasure Filters
//------------------------------------------------------------------------------

export const defaultCreatureTreasureFilters: CreatureTreasureFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
