import z from "zod";
import { equipmentFiltersSchema } from "../equipment-filters";

//------------------------------------------------------------------------------
// Item Filters
//------------------------------------------------------------------------------

export const itemFiltersSchema = equipmentFiltersSchema.extend({});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;

//------------------------------------------------------------------------------
// Default Item Filters
//------------------------------------------------------------------------------

export const defaultItemFilters: ItemFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
