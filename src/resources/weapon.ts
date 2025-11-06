import z from "zod";
import { i18nStringSchema } from "../i18n/i18n-string";
import { resourceFiltersSchema, resourceSchema } from "./resource";
import { damageTypeSchema } from "./types/damage-type";
import { weaponMasterySchema } from "./types/weapon-mastery";
import { weaponPropertySchema } from "./types/weapon-property";
import { weaponTypeSchema } from "./types/weapon-type";

//------------------------------------------------------------------------------
// Weapon
//------------------------------------------------------------------------------

export const weaponSchema = resourceSchema.extend({
  type: weaponTypeSchema,

  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string().nullish(),

  mastery: weaponMasterySchema,
  properties: z.array(weaponPropertySchema),

  magic: z.boolean(),
  melee: z.boolean(),
  ranged: z.boolean(),

  range_ft_long: z.number().nullish(),
  range_ft_short: z.number().nullish(),
  range_m_long: z.number().nullish(),
  range_m_short: z.number().nullish(),

  ammunition: i18nStringSchema,

  weight_kg: z.number(),
  weight_lb: z.number(),

  cost: z.number(),

  notes: i18nStringSchema,
  page: i18nStringSchema,
});

export type Weapon = z.infer<typeof weaponSchema>;

//------------------------------------------------------------------------------
// Weapon Filters
//------------------------------------------------------------------------------

export const weaponFiltersSchema = resourceFiltersSchema.extend({
  masteries: z
    .partialRecord(weaponMasterySchema, z.boolean().optional())
    .optional(),
  properties: z
    .partialRecord(weaponPropertySchema, z.boolean().optional())
    .optional(),
  types: z.partialRecord(weaponTypeSchema, z.boolean().optional()).optional(),

  magic: z.boolean().optional(),
  melee: z.boolean().optional(),
  ranged: z.boolean().optional(),
});

export type WeaponFilters = z.infer<typeof weaponFiltersSchema>;

//------------------------------------------------------------------------------
// Default Weapon
//------------------------------------------------------------------------------

export const defaultWeapon: Weapon = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  type: "simple",

  damage: "",
  damage_type: "slashing",
  damage_versatile: undefined,

  mastery: "cleave",
  properties: [],

  magic: false,
  melee: true,
  ranged: false,

  range_ft_long: undefined,
  range_ft_short: undefined,
  range_m_long: undefined,
  range_m_short: undefined,

  ammunition: {},

  weight_kg: 0,
  weight_lb: 0,

  cost: 0,

  name: {},
  notes: {},
  page: {},

  visibility: "game_master",
};

//------------------------------------------------------------------------------
// Default Weapon Filters
//------------------------------------------------------------------------------

export const defaultWeaponFilters: WeaponFilters = {
  order_by: "name",
  order_dir: "asc",
};
