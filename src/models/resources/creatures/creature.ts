import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  defaultEquipmentBundle,
  equipmentBundleFromEntries,
  equipmentEntrySchema,
} from "../../other/equipment-bundle";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureConditionSchema } from "../../types/creature-condition";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureSkillSchema } from "../../types/creature-skill";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { creatureTypeSchema } from "../../types/creature-type";
import { damageTypeSchema } from "../../types/damage-type";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature
//------------------------------------------------------------------------------

export const creatureSchema = resourceSchema
  .extend({
    ability_cha: z.number(),
    ability_con: z.number(),
    ability_dex: z.number(),
    ability_int: z.number(),
    ability_proficiencies: z.array(creatureAbilitySchema),
    ability_str: z.number(),
    ability_wis: z.number(),
    ac: z.number(),
    actions: i18nStringSchema,
    alignment: creatureAlignmentSchema,
    blindsight: z.number(),
    bonus_actions: i18nStringSchema,
    condition_immunities: z.array(creatureConditionSchema),
    condition_resistances: z.array(creatureConditionSchema),
    condition_vulnerabilities: z.array(creatureConditionSchema),
    cr: z.number(),
    damage_immunities: z.array(damageTypeSchema),
    damage_resistances: z.array(damageTypeSchema),
    damage_vulnerabilities: z.array(damageTypeSchema),
    darkvision: z.number(),
    equipment_entries: z.array(equipmentEntrySchema),
    habitats: z.array(creatureHabitatSchema),
    hp: z.number(),
    hp_formula: z.string(),
    initiative: z.number(),
    languages: i18nStringSchema,
    legendary_actions: i18nStringSchema,
    passive_perception: z.number(),
    planes: i18nStringSchema,
    reactions: i18nStringSchema,
    senses: i18nStringSchema,
    size: creatureSizeSchema,
    skill_expertise: z.array(creatureSkillSchema),
    skill_proficiencies: z.array(creatureSkillSchema),
    speed_burrow: z.number(),
    speed_climb: z.number(),
    speed_fly: z.number(),
    speed_swim: z.number(),
    speed_walk: z.number(),
    traits: i18nStringSchema,
    treasures: z.array(creatureTreasureSchema),
    tremorsense: z.number(),
    truesight: z.number(),
    type: creatureTypeSchema,
  })
  .transform(({ equipment_entries, ...rest }) => ({
    ...rest,
    gear: equipmentBundleFromEntries(equipment_entries),
  }));

export type Creature = z.infer<typeof creatureSchema>;

//------------------------------------------------------------------------------
// Default Creature
//------------------------------------------------------------------------------

export const defaultCreature: Creature = {
  ...defaultResource,
  ability_cha: 10,
  ability_con: 10,
  ability_dex: 10,
  ability_int: 10,
  ability_proficiencies: [],
  ability_str: 10,
  ability_wis: 10,
  ac: 10,
  actions: {},
  alignment: "true_neutral",
  blindsight: 0,
  bonus_actions: {},
  condition_immunities: [],
  condition_resistances: [],
  condition_vulnerabilities: [],
  cr: 0,
  damage_immunities: [],
  damage_resistances: [],
  damage_vulnerabilities: [],
  darkvision: 0,
  gear: defaultEquipmentBundle,
  habitats: [],
  hp: 11,
  hp_formula: "2d10",
  initiative: 0,
  languages: {},
  legendary_actions: {},
  passive_perception: 10,
  planes: {},
  reactions: {},
  senses: {},
  size: "medium",
  skill_expertise: [],
  skill_proficiencies: [],
  speed_burrow: 0,
  speed_climb: 0,
  speed_fly: 0,
  speed_swim: 0,
  speed_walk: 0,
  traits: {},
  treasures: [],
  tremorsense: 0,
  truesight: 0,
  type: "beast",
};

//------------------------------------------------------------------------------
// Creature Translation Fields
//------------------------------------------------------------------------------

export const creatureTranslationFields: TranslationFields<Creature>[] = [
  ...resourceTranslationFields,
  "actions",
  "bonus_actions",
  "languages",
  "legendary_actions",
  "planes",
  "reactions",
  "senses",
  "traits",
];
