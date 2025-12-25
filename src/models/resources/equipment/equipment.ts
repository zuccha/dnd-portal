import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { resourceFiltersSchema, resourceSchema } from "../resource";

//------------------------------------------------------------------------------
// Equipment
//------------------------------------------------------------------------------

export const equipmentSchema = resourceSchema.extend({
  cost: z.number(),
  magic: z.boolean(),
  notes: i18nStringSchema,
  weight: z.number(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

//------------------------------------------------------------------------------
// Equipment Filters
//------------------------------------------------------------------------------

export const equipmentFiltersSchema = resourceFiltersSchema.extend({});

export type EquipmentFilters = z.infer<typeof equipmentFiltersSchema>;

//------------------------------------------------------------------------------
// Default Equipment
//------------------------------------------------------------------------------

export const defaultEquipment: Equipment = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  magic: false,
  notes: {},
  weight: 0,
};

//------------------------------------------------------------------------------
// Default Equipment Filters
//------------------------------------------------------------------------------

export const defaultEquipmentFilters: EquipmentFilters = {
  order_by: "name",
  order_dir: "asc",
};
