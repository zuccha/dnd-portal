import z from "zod";
import { armorTypeSchema } from "../../../types/armor-type";
import { equipmentFiltersSchema } from "../equipment-filters";

//------------------------------------------------------------------------------
// Armor Filters
//------------------------------------------------------------------------------

export const armorFiltersSchema = equipmentFiltersSchema.extend({
  types: z.partialRecord(armorTypeSchema, z.boolean().optional()).optional(),
});

export type ArmorFilters = z.infer<typeof armorFiltersSchema>;

//------------------------------------------------------------------------------
// Default Armor Filters
//------------------------------------------------------------------------------

export const defaultArmorFilters: ArmorFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
