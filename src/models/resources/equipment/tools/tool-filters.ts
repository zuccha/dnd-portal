import z from "zod";
import { creatureAbilitySchema } from "../../../types/creature-ability";
import { toolTypeSchema } from "../../../types/tool-type";
import {
  equipmentFiltersSchema,
  equipmentOrderOptions,
} from "../equipment-filters";

//------------------------------------------------------------------------------
// Tool Order Options
//------------------------------------------------------------------------------

export const toolOrderOptions = equipmentOrderOptions;

//------------------------------------------------------------------------------
// Tool Filters
//------------------------------------------------------------------------------

export const toolFiltersSchema = equipmentFiltersSchema.extend({
  abilities: z
    .partialRecord(creatureAbilitySchema, z.boolean().optional())
    .optional(),
  types: z.partialRecord(toolTypeSchema, z.boolean().optional()).optional(),
});

export type ToolFilters = z.infer<typeof toolFiltersSchema>;

//------------------------------------------------------------------------------
// Default Tool Filters
//------------------------------------------------------------------------------

export const defaultToolFilters: ToolFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
