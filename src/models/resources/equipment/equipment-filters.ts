import z from "zod";
import { resourceFiltersSchema } from "../resource-filters";

//------------------------------------------------------------------------------
// Equipment Filters
//------------------------------------------------------------------------------

export const equipmentFiltersSchema = resourceFiltersSchema.extend({
  magic: z.boolean().optional(),
});

export type EquipmentFilters = z.infer<typeof equipmentFiltersSchema>;

//------------------------------------------------------------------------------
// Default Equipment Filters
//------------------------------------------------------------------------------

export const defaultEquipmentFilters: EquipmentFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
