import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { damageTypeSchema } from "../../../types/damage-type";
import { weaponMasterySchema } from "../../../types/weapon-mastery";
import { weaponPropertySchema } from "../../../types/weapon-property";
import { weaponTypeSchema } from "../../../types/weapon-type";
import { equipmentFiltersSchema, equipmentSchema } from "../equipment";

//------------------------------------------------------------------------------
// Weapon
//------------------------------------------------------------------------------

export const weaponSchema = equipmentSchema.extend({
  ammunition: i18nStringSchema,
  damage: z.string(),
  damage_type: damageTypeSchema,
  damage_versatile: z.string().nullish(),
  mastery: weaponMasterySchema,
  melee: z.boolean(),
  properties: z.array(weaponPropertySchema),
  range_long: z.number().nullish(),
  range_short: z.number().nullish(),
  ranged: z.boolean(),
  type: weaponTypeSchema,
});

export type Weapon = z.infer<typeof weaponSchema>;

//------------------------------------------------------------------------------
// Weapon Filters
//------------------------------------------------------------------------------

export const weaponFiltersSchema = equipmentFiltersSchema.extend({
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

  visibility: "game_master",

  name: {},
  page: {},

  cost: 0,
  weight: 0,

  notes: {},

  ammunition: {},
  damage: "",
  damage_type: "slashing",
  damage_versatile: undefined,
  magic: false,
  mastery: "cleave",
  melee: true,
  properties: [],
  range_long: undefined,
  range_short: undefined,
  ranged: false,
  type: "simple",
};

//------------------------------------------------------------------------------
// Default Weapon Filters
//------------------------------------------------------------------------------

export const defaultWeaponFilters: WeaponFilters = {
  order_by: "name",
  order_dir: "asc",
};
