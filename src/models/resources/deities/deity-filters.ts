import { z } from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { deityDomainSchema } from "../../types/deity-domain";
import { resourceFiltersSchema, resourceOrderOptions } from "../resource-filters";

//------------------------------------------------------------------------------
// Deity Order Options
//------------------------------------------------------------------------------

export const deityOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Deity Filters
//------------------------------------------------------------------------------

export const deityFiltersSchema = resourceFiltersSchema.extend({
  alignment: z.partialRecord(creatureAlignmentSchema, z.boolean().optional()).optional(),
  domain: z.partialRecord(deityDomainSchema, z.boolean().optional()).optional(),
});

//------------------------------------------------------------------------------
// Deity Filters Type
//------------------------------------------------------------------------------

export type DeityFilters = ReturnType<typeof deityFiltersSchema.parse>;

//------------------------------------------------------------------------------
// Default Deity Filters
//------------------------------------------------------------------------------

export const defaultDeityFilters: DeityFilters = {
  alignment: {},
  domain: {},
  name: "",
  order_by: "name",
  order_dir: "asc",
};
