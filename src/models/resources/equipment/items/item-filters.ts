import z from "zod";
import { itemTypeSchema } from "../../../types/item-type";
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

export const itemFiltersSchema = equipmentFiltersSchema.extend({
  types: z.partialRecord(itemTypeSchema, z.boolean().optional()).optional(),
});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;

//------------------------------------------------------------------------------
// Default Item Filters
//------------------------------------------------------------------------------

export const defaultItemFilters: ItemFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
