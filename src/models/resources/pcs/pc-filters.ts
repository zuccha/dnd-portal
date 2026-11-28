import z from "zod";
import { pcStatusSchema } from "../../types/pc-status";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// PC Order Options
//------------------------------------------------------------------------------

export const pcOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// PC Filters
//------------------------------------------------------------------------------

export const pcFiltersSchema = resourceFiltersSchema.extend({
  statuses: z.partialRecord(pcStatusSchema, z.boolean().optional()).optional(),
});

//------------------------------------------------------------------------------
// PC Filters Type
//------------------------------------------------------------------------------

export type PcFilters = z.infer<typeof pcFiltersSchema>;

//------------------------------------------------------------------------------
// Default PC Filters
//------------------------------------------------------------------------------

export const defaultPcFilters: PcFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
