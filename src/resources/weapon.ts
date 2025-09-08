import z from "zod";
import { i18nStringSchema } from "../i18n/i18n-string";
import { damageTypeSchema } from "./damage-type";
import { createResourceStore } from "./resource";
import { weaponMasterySchema } from "./weapon-mastery";
import { weaponPropertySchema } from "./weapon-property";
import { weaponTypeSchema } from "./weapon-type";

//------------------------------------------------------------------------------
// Weapon
//------------------------------------------------------------------------------

export const weaponSchema = z.object({
  id: z.uuid(),

  campaign_id: z.string(),
  campaign_name: z.string(),

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

  name: i18nStringSchema,
  notes: i18nStringSchema,
  page: i18nStringSchema,
});

export type Weapon = z.infer<typeof weaponSchema>;

//------------------------------------------------------------------------------
// Weapon Translation
//------------------------------------------------------------------------------

export const weaponTranslationSchema = z.object({
  lang: z.string(),
  weapon_id: z.uuid(),

  ammunition: z.string().nullish(),
  name: z.string(),
  notes: z.string().nullish(),
  page: z.string().nullish(),
});

export type WeaponTranslation = z.infer<typeof weaponTranslationSchema>;

//------------------------------------------------------------------------------
// Weapon Filters
//------------------------------------------------------------------------------

export const weaponFiltersSchema = z.object({
  order_by: z.enum(["name"]).default("name"),
  order_dir: z.enum(["asc", "desc"]).default("asc"),

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
};

//------------------------------------------------------------------------------
// Weapons Store
//------------------------------------------------------------------------------

export const weaponsStore = createResourceStore(
  { p: "weapons", s: "weapon" },
  weaponSchema,
  weaponFiltersSchema
);

export const {
  useFromCampaign: useWeaponsFromCampaign,
  useFilters: useWeaponFilters,
  useNameFilter: useWeaponNameFilter,
  useIsSelected: useIsWeaponSelected,
  useSelectionCount: useWeaponsSelectionCount,
  update: updateWeapon,
} = weaponsStore;
