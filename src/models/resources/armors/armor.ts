import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { armorTypeSchema } from "../../types/armor-type";
import {
  equipmentFiltersSchema,
  equipmentSchema,
} from "../equipment/equipment";

//------------------------------------------------------------------------------
// Armor
//------------------------------------------------------------------------------

export const armorSchema = equipmentSchema.extend({
  armor_class_max_cha_modifier: z.number().nullish(),
  armor_class_max_con_modifier: z.number().nullish(),
  armor_class_max_dex_modifier: z.number().nullish(),
  armor_class_max_int_modifier: z.number().nullish(),
  armor_class_max_str_modifier: z.number().nullish(),
  armor_class_max_wis_modifier: z.number().nullish(),
  armor_class_modifier: z.number(),
  base_armor_class: z.number(),
  cost: z.number(),
  disadvantage_on_stealth: z.boolean(),
  notes: i18nStringSchema,
  required_cha: z.number(),
  required_con: z.number(),
  required_dex: z.number(),
  required_int: z.number(),
  required_str: z.number(),
  required_wis: z.number(),
  type: armorTypeSchema,
  weight: z.number(),
});

export type Armor = z.infer<typeof armorSchema>;

//------------------------------------------------------------------------------
// Armor Filters
//------------------------------------------------------------------------------

export const armorFiltersSchema = equipmentFiltersSchema.extend({
  types: z.partialRecord(armorTypeSchema, z.boolean().optional()).optional(),
});

export type ArmorFilters = z.infer<typeof armorFiltersSchema>;

//------------------------------------------------------------------------------
// Default Armor
//------------------------------------------------------------------------------

export const defaultArmor: Armor = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  magic: false,
  weight: 0,

  notes: {},

  armor_class_max_cha_modifier: 0,
  armor_class_max_con_modifier: 0,
  armor_class_max_dex_modifier: 0,
  armor_class_max_int_modifier: 0,
  armor_class_max_str_modifier: 0,
  armor_class_max_wis_modifier: 0,
  armor_class_modifier: 0,
  base_armor_class: 0,
  disadvantage_on_stealth: false,
  required_cha: 0,
  required_con: 0,
  required_dex: 0,
  required_int: 0,
  required_str: 0,
  required_wis: 0,
  type: "light",
};

//------------------------------------------------------------------------------
// Default Armor Filters
//------------------------------------------------------------------------------

export const defaultArmorFilters: ArmorFilters = {
  order_by: "name",
  order_dir: "asc",
};
