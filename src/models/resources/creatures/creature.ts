import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureConditionSchema } from "../../types/creature-condition";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureSkillSchema } from "../../types/creature-skill";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { creatureTypeSchema } from "../../types/creature-type";
import { damageTypeSchema } from "../../types/damage-type";
import { resourceSchema } from "../resource";

//------------------------------------------------------------------------------
// Creature
//------------------------------------------------------------------------------

export const creatureSchema = resourceSchema.extend({
  alignment: creatureAlignmentSchema,
  habitats: z.array(creatureHabitatSchema),
  size: creatureSizeSchema,
  treasures: z.array(creatureTreasureSchema),
  type: creatureTypeSchema,

  ac: z.number(),
  cr: z.number(),
  hp: z.number(),
  hp_formula: z.string(),

  speed_burrow: z.number(),
  speed_climb: z.number(),
  speed_fly: z.number(),
  speed_swim: z.number(),
  speed_walk: z.number(),

  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_str: z.number(),
  ability_wis: z.number(),

  initiative: z.number(),
  passive_perception: z.number(),

  ability_proficiencies: z.array(creatureAbilitySchema),
  skill_expertise: z.array(creatureSkillSchema),
  skill_proficiencies: z.array(creatureSkillSchema),

  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),

  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),

  gear: i18nStringSchema,
  languages: i18nStringSchema,
  planes: i18nStringSchema,
  senses: i18nStringSchema,

  blindsight: z.number(),
  darkvision: z.number(),
  tremorsense: z.number(),
  truesight: z.number(),

  actions: i18nStringSchema,
  bonus_actions: i18nStringSchema,
  legendary_actions: i18nStringSchema,
  reactions: i18nStringSchema,
  traits: i18nStringSchema,
});

export type Creature = z.infer<typeof creatureSchema>;

//------------------------------------------------------------------------------
// Default Creature
//------------------------------------------------------------------------------

export const defaultCreature: Creature = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  alignment: "true_neutral",
  habitats: [],
  size: "medium",
  treasures: [],
  type: "beast",

  ac: 10,
  cr: 0,
  hp: 11,
  hp_formula: "2d10",

  speed_burrow: 0,
  speed_climb: 0,
  speed_fly: 0,
  speed_swim: 0,
  speed_walk: 0,

  ability_cha: 10,
  ability_con: 10,
  ability_dex: 10,
  ability_int: 10,
  ability_str: 10,
  ability_wis: 10,

  initiative: 0,
  passive_perception: 10,

  ability_proficiencies: [],
  skill_expertise: [],
  skill_proficiencies: [],

  damage_immunities: [],
  damage_resistances: [],
  damage_vulnerabilities: [],

  condition_immunities: [],
  condition_resistances: [],
  condition_vulnerabilities: [],

  name: {},

  page: {},

  gear: {},
  languages: {},
  planes: {},
  senses: {},

  blindsight: 0,
  darkvision: 0,
  tremorsense: 0,
  truesight: 0,

  actions: {},
  bonus_actions: {},
  legendary_actions: {},
  reactions: {},
  traits: {},

  visibility: "game_master",
};
