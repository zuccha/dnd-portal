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
  charges_min: z.number().min(0).default(0),
  consumable: z.boolean().optional(),
  types: z.partialRecord(itemTypeSchema, z.boolean().optional()).optional(),
});

export type ItemFilters = z.infer<typeof itemFiltersSchema>;

//------------------------------------------------------------------------------
// Default Item Filters
//------------------------------------------------------------------------------

export const defaultItemFilters: ItemFilters = {
  charges_min: 0,
  name: "",
  order_by: "name",
  order_dir: "asc",
};
