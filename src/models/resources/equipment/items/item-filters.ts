import z from "zod";
import {
  equipmentFiltersSchema,
  equipmentOrderOptions,
} from "../equipment-filters";

//------------------------------------------------------------------------------
// Item Order Options
//------------------------------------------------------------------------------

export const itemOrderOptions = equipmentOrderOptions;

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
