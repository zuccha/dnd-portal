import z from "zod";
import { equipmentFiltersSchema, equipmentSchema } from "../equipment";

//------------------------------------------------------------------------------
// Item
//------------------------------------------------------------------------------

export const itemSchema = equipmentSchema.extend({});

export type Item = z.infer<typeof itemSchema>;

//------------------------------------------------------------------------------
// Item Filters
//------------------------------------------------------------------------------

export const itemFiltersSchema = equipmentFiltersSchema.extend({});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;

//------------------------------------------------------------------------------
// Default Item
//------------------------------------------------------------------------------

export const defaultItem: Item = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  magic: false,
  weight: 0,

  notes: {},
};

//------------------------------------------------------------------------------
// Default Item Filters
//------------------------------------------------------------------------------

export const defaultItemFilters: ItemFilters = {
  order_by: "name",
  order_dir: "asc",
};
