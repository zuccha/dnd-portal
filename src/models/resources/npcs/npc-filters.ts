import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// NPC Order Options
//------------------------------------------------------------------------------

export const npcOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// NPC Filters
//------------------------------------------------------------------------------

export const npcFiltersSchema = resourceFiltersSchema.extend({});

//------------------------------------------------------------------------------
// NPC Filters Type
//------------------------------------------------------------------------------

export type NpcFilters = ReturnType<typeof npcFiltersSchema.parse>;

//------------------------------------------------------------------------------
// Default NPC Filters
//------------------------------------------------------------------------------

export const defaultNpcFilters: NpcFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
