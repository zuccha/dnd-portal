import z from "zod";
import { i18nStringSchema } from "../../i18n/i18n-string";
import { resourceFiltersSchema, resourceSchema } from "../resource";
import { creatureAbilitySchema } from "../types/creature-ability";
import { creatureAlignmentSchema } from "../types/creature-alignment";
import { creatureConditionSchema } from "../types/creature-condition";
import { creatureHabitatSchema } from "../types/creature-habitat";
import { creatureSizeSchema } from "../types/creature-size";
import { creatureSkillSchema } from "../types/creature-skill";
import { creatureTreasureSchema } from "../types/creature-treasure";
import { creatureTypeSchema } from "../types/creature-type";
import { damageTypeSchema } from "../types/damage-type";

//------------------------------------------------------------------------------
// Creature
//------------------------------------------------------------------------------

export const creatureSchema = resourceSchema.extend({
  alignment: creatureAlignmentSchema,
  habitat: z.array(creatureHabitatSchema),
  size: creatureSizeSchema,
  treasures: z.array(creatureTreasureSchema),
  type: creatureTypeSchema,

  ac: z.string(),
  cr: z.number(),
  hp: z.string(),
  hp_formula: z.string(),

  speed_burrow: z.string().nullish(),
  speed_climb: z.string().nullish(),
  speed_fly: z.string().nullish(),
  speed_swim: z.string().nullish(),
  speed_walk: z.string().nullish(),

  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_str: z.number(),
  ability_wis: z.number(),

  initiative: z.string(),
  passive_perception: z.string(),

  ability_proficiencies: z.array(creatureAbilitySchema),
  skill_proficiencies: z.array(creatureSkillSchema),

  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),

  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),

  page: i18nStringSchema.nullish(),

  gear: i18nStringSchema,
  languages: i18nStringSchema,
  planes: i18nStringSchema,
  senses: i18nStringSchema,

  actions: i18nStringSchema,
  bonus_actions: i18nStringSchema,
  legendary_actions: i18nStringSchema,
  reactions: i18nStringSchema,
  traits: i18nStringSchema,
});

export type Creature = z.infer<typeof creatureSchema>;

//------------------------------------------------------------------------------
// Creature Filters
//------------------------------------------------------------------------------

export const creatureFiltersSchema = resourceFiltersSchema.extend({
  alignment: z
    .partialRecord(creatureAlignmentSchema, z.boolean().optional())
    .optional(),
  habitat: z
    .partialRecord(creatureHabitatSchema, z.boolean().optional())
    .optional(),
  size: z.partialRecord(creatureSizeSchema, z.boolean().optional()).optional(),
  treasures: z
    .partialRecord(creatureTreasureSchema, z.boolean().optional())
    .optional(),
  types: z.partialRecord(creatureTypeSchema, z.boolean().optional()).optional(),

  cr_max: z.number(),
  cr_min: z.number(),
});

export type CreatureFilters = z.infer<typeof creatureFiltersSchema>;

//------------------------------------------------------------------------------
// Default Creature
//------------------------------------------------------------------------------

export const defaultCreature: Creature = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  alignment: "true_neutral",
  habitat: [],
  size: "medium",
  treasures: [],
  type: "beast",

  ac: "10",
  cr: 0,
  hp: "11",
  hp_formula: "2d10",

  speed_burrow: undefined,
  speed_climb: undefined,
  speed_fly: undefined,
  speed_swim: undefined,
  speed_walk: undefined,

  ability_cha: 10,
  ability_con: 10,
  ability_dex: 10,
  ability_int: 10,
  ability_str: 10,
  ability_wis: 10,

  initiative: "+0 (10)",
  passive_perception: "10",

  ability_proficiencies: [],
  skill_proficiencies: [],

  damage_immunities: [],
  damage_resistances: [],
  damage_vulnerabilities: [],

  condition_immunities: [],
  condition_resistances: [],
  condition_vulnerabilities: [],

  name: {},

  page: undefined,

  gear: {},
  languages: {},
  planes: {},
  senses: {},

  actions: {},
  bonus_actions: {},
  legendary_actions: {},
  reactions: {},
  traits: {},

  visibility: "game_master",
};

//------------------------------------------------------------------------------
// Default Creature Filters
//------------------------------------------------------------------------------

export const defaultCreatureFilters: CreatureFilters = {
  order_by: "name",
  order_dir: "asc",

  alignment: {},
  habitat: {},
  size: {},
  treasures: {},
  types: {},

  cr_max: 30,
  cr_min: 0,
};
