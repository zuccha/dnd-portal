import z from "zod";
import { equipmentRaritySchema } from "../../types/equipment-rarity";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Equipment Order Options
//------------------------------------------------------------------------------

export const equipmentOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Equipment Filters
//------------------------------------------------------------------------------

export const equipmentFiltersSchema = resourceFiltersSchema.extend({
  magic: z.boolean().optional(),
  rarities: z
    .partialRecord(equipmentRaritySchema, z.boolean().optional())
    .optional(),
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
