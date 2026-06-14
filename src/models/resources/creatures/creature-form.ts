import z from "zod";
import { createForm } from "~/utils/form";
import {
  defaultEquipmentBundle,
  equipmentBundleSchema,
  equipmentBundleToEntries,
} from "../../other/equipment-bundle";
import { languageEntrySchema } from "../../other/language-entries";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureChallengeRatingSchema } from "../../types/creature-challenge-rating";
import { creatureConditionSchema } from "../../types/creature-condition";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureSkillSchema } from "../../types/creature-skill";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { creatureTypeSchema } from "../../types/creature-type";
import { damageTypeSchema } from "../../types/damage-type";
import { languageScopeSchema } from "../../types/language-scope";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBCreature, type DBCreatureTranslation } from "./db-creature";

//------------------------------------------------------------------------------
// Creature Form Data
//------------------------------------------------------------------------------

export const creatureFormDataSchema = resourceFormDataSchema.extend({
  ability_cha: z.number().default(10),
  ability_con: z.number().default(10),
  ability_dex: z.number().default(10),
  ability_int: z.number().default(10),
  ability_proficiencies: z.array(creatureAbilitySchema).default([]),
  ability_str: z.number().default(10),
  ability_wis: z.number().default(10),
  ac: z.number().default(10),
  actions: z.string().default(""),
  alignment: creatureAlignmentSchema.default("true_neutral"),
  blindsight: z.number().default(0),
  bonus_actions: z.string().default(""),
  condition_immunities: z.array(creatureConditionSchema).default([]),
  condition_resistances: z.array(creatureConditionSchema).default([]),
  condition_vulnerabilities: z.array(creatureConditionSchema).default([]),
  cr: creatureChallengeRatingSchema.default(1),
  damage_immunities: z.array(damageTypeSchema).default([]),
  damage_resistances: z.array(damageTypeSchema).default([]),
  damage_vulnerabilities: z.array(damageTypeSchema).default([]),
  darkvision: z.number().default(0),
  gear: equipmentBundleSchema.default(defaultEquipmentBundle),
  habitats: z.array(creatureHabitatSchema).default([]),
  has_lair: z.boolean().default(false),
  hover: z.boolean().default(false),
  hp: z.number().default(10),
  hp_formula: z.string().default(""),
  initiative: z.number().default(0),
  lair_effects: z.string().default(""),
  language_additional_count: z.number().default(0),
  language_entries: z.array(languageEntrySchema).default([]),
  language_scope: languageScopeSchema.default("specific"),
  legendary_actions: z.string().default(""),
  passive_perception: z.number().default(10),
  plane_ids: z.array(z.uuid()).default([]),
  reactions: z.string().default(""),
  size: creatureSizeSchema.default("medium"),
  skill_expertise: z.array(creatureSkillSchema).default([]),
  skill_proficiencies: z.array(creatureSkillSchema).default([]),
  speed_burrow: z.number().default(0),
  speed_climb: z.number().default(0),
  speed_fly: z.number().default(0),
  speed_swim: z.number().default(0),
  speed_walk: z.number().default(900),
  tag_ids: z.array(z.uuid()).default([]),
  telepathy_range: z.number().default(0),
  traits: z.string().default(""),
  treasures: z.array(creatureTreasureSchema).default([]),
  tremorsense: z.number().default(0),
  truesight: z.number().default(0),
  type: creatureTypeSchema.default("humanoid"),
});

export type CreatureFormData = z.infer<typeof creatureFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Form Data To DB
//------------------------------------------------------------------------------

export function creatureFormDataToDB(data: Partial<CreatureFormData>): {
  resource: Partial<DBCreature>;
  translation: Partial<DBCreatureTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      ability_cha: data.ability_cha,
      ability_con: data.ability_con,
      ability_dex: data.ability_dex,
      ability_int: data.ability_int,
      ability_proficiencies: data.ability_proficiencies,
      ability_str: data.ability_str,
      ability_wis: data.ability_wis,
      ac: data.ac,
      alignment: data.alignment,
      blindsight: data.blindsight,
      condition_immunities: data.condition_immunities,
      condition_resistances: data.condition_resistances,
      condition_vulnerabilities: data.condition_vulnerabilities,
      cr: data.cr,
      damage_immunities: data.damage_immunities,
      damage_resistances: data.damage_resistances,
      damage_vulnerabilities: data.damage_vulnerabilities,
      darkvision: data.darkvision,
      equipment_entries: data.gear && equipmentBundleToEntries(data.gear),
      habitats: data.habitats,
      has_lair: data.has_lair,
      hover: data.hover,
      hp: data.hp,
      hp_formula: data.hp_formula,
      initiative: data.initiative,
      language_additional_count: data.language_additional_count,
      language_entries: data.language_entries,
      language_scope: data.language_scope,
      passive_perception: data.passive_perception,
      plane_ids: data.plane_ids,
      size: data.size,
      skill_expertise: data.skill_expertise,
      skill_proficiencies: data.skill_proficiencies,
      speed_burrow: data.speed_burrow,
      speed_climb: data.speed_climb,
      speed_fly: data.speed_fly,
      speed_swim: data.speed_swim,
      speed_walk: data.speed_walk,
      tag_ids: data.tag_ids,
      telepathy_range: data.telepathy_range,
      treasures: data.treasures,
      tremorsense: data.tremorsense,
      truesight: data.truesight,
      type: data.type,
    },
    translation: {
      ...translation,
      actions: data.actions,
      bonus_actions: data.bonus_actions,
      lair_effects: data.lair_effects,
      legendary_actions: data.legendary_actions,
      reactions: data.reactions,
      traits: data.traits,
    },
  };
}

//------------------------------------------------------------------------------
// Creature Form
//------------------------------------------------------------------------------

export const creatureForm = createForm(
  "creature",
  creatureFormDataSchema.parse,
);
