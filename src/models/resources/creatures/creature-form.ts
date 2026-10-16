import z from "zod";
import { createForm } from "~/utils/form";
import { defaultEquipmentBundle, equipmentBundleSchema } from "../../other/equipment-bundle";
import { languageEntrySchema } from "../../other/language-entries";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureChallengeRatingSchema } from "../../types/creature-challenge-rating";
import { creatureConditionSchema } from "../../types/creature-condition";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureSkillSchema } from "../../types/creature-skill";
import { creatureTypeSchema } from "../../types/creature-type";
import { damageTypeSchema } from "../../types/damage-type";
import { languageScopeSchema } from "../../types/language-scope";
import { summonerLanguageModeSchema } from "../../types/summoner-language-mode";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Creature } from "./creature";

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
  actions: z.string().default(""),
  additional_hp_per_level: z.number().default(0),
  additional_hp_starting_from_level: z.number().default(0),
  adds_spell_level_to_armor_class: z.boolean().default(false),
  alignment: creatureAlignmentSchema.default("true_neutral"),
  armor_class: z.number().default(10),
  blindsight: z.number().default(0),
  bonus_actions: z.string().default(""),
  can_hover: z.boolean().default(false),
  challenge_rating: creatureChallengeRatingSchema.default(1),
  condition_immunities: z.array(creatureConditionSchema).default([]),
  condition_resistances: z.array(creatureConditionSchema).default([]),
  condition_vulnerabilities: z.array(creatureConditionSchema).default([]),
  damage_immunities: z.array(damageTypeSchema).default([]),
  damage_resistances: z.array(damageTypeSchema).default([]),
  damage_vulnerabilities: z.array(damageTypeSchema).default([]),
  darkvision: z.number().default(0),
  experience_points: z.number().default(200),
  family_id: z.uuid().nullable().default(null),
  gear: equipmentBundleSchema.default(defaultEquipmentBundle),
  has_lair: z.boolean().default(false),
  hit_points: z.number().default(10),
  hit_points_formula: z.string().default(""),
  initiative: z.number().default(0),
  is_summoned_from_spell: z.boolean().default(false),
  lair_effects: z.string().default(""),
  lair_experience_points: z.number().default(450),
  lair_legendary_actions_count: z.number().default(0),
  language_additional_count: z.number().default(0),
  language_entries: z.array(languageEntrySchema).default([]),
  language_scope: languageScopeSchema.default("specific"),
  legendary_actions: z.string().default(""),
  legendary_actions_count: z.number().default(0),
  passive_perception: z.number().default(10),
  proficiency_bonus: z.number().default(2),
  reactions: z.string().default(""),
  sizes: z.array(creatureSizeSchema).min(1).default(["medium"]),
  skill_expertise: z.array(creatureSkillSchema).default([]),
  skill_proficiencies: z.array(creatureSkillSchema).default([]),
  speed_burrow: z.number().default(0),
  speed_climb: z.number().default(0),
  speed_fly: z.number().default(0),
  speed_swim: z.number().default(0),
  speed_walk: z.number().default(900),
  summoner_language_mode: summonerLanguageModeSchema.default("none"),
  tag_ids: z.array(z.uuid()).default([]),
  telepathy_range: z.number().default(0),
  traits: z.string().default(""),
  tremorsense: z.number().default(0),
  truesight: z.number().default(0),
  type: creatureTypeSchema.default("humanoid"),
});

export type CreatureFormData = z.infer<typeof creatureFormDataSchema>;

//------------------------------------------------------------------------------
// Creature Form Data To Resource
//------------------------------------------------------------------------------

export function creatureFormDataToResource(
  data: Partial<CreatureFormData>,
  lang: string,
): Partial<Creature> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    ability_cha: data.ability_cha,
    ability_con: data.ability_con,
    ability_dex: data.ability_dex,
    ability_int: data.ability_int,
    ability_proficiencies: data.ability_proficiencies,
    ability_str: data.ability_str,
    ability_wis: data.ability_wis,
    actions: createResourceFormDataI18nValue(data.actions, lang),
    additional_hp_per_level: data.additional_hp_per_level,
    additional_hp_starting_from_level: data.additional_hp_starting_from_level,
    adds_spell_level_to_armor_class: data.adds_spell_level_to_armor_class,
    alignment: data.alignment,
    armor_class: data.armor_class,
    blindsight: data.blindsight,
    bonus_actions: createResourceFormDataI18nValue(data.bonus_actions, lang),
    can_hover: data.can_hover,
    challenge_rating: data.challenge_rating,
    condition_immunities: data.condition_immunities,
    condition_resistances: data.condition_resistances,
    condition_vulnerabilities: data.condition_vulnerabilities,
    damage_immunities: data.damage_immunities,
    damage_resistances: data.damage_resistances,
    damage_vulnerabilities: data.damage_vulnerabilities,
    darkvision: data.darkvision,
    experience_points: data.experience_points,
    family_id: data.family_id,
    gear: data.gear,
    has_lair: data.has_lair,
    hit_points: data.hit_points,
    hit_points_formula: data.hit_points_formula,
    initiative: data.initiative,
    is_summoned_from_spell: data.is_summoned_from_spell,
    lair_effects: createResourceFormDataI18nValue(data.lair_effects, lang),
    lair_experience_points: data.lair_experience_points,
    lair_legendary_actions_count: data.lair_legendary_actions_count,
    language_additional_count: data.language_additional_count,
    language_entries: data.language_entries,
    language_scope: data.language_scope,
    legendary_actions: createResourceFormDataI18nValue(data.legendary_actions, lang),
    legendary_actions_count: data.legendary_actions_count,
    passive_perception: data.passive_perception,
    proficiency_bonus: data.proficiency_bonus,
    reactions: createResourceFormDataI18nValue(data.reactions, lang),
    sizes: data.sizes,
    skill_expertise: data.skill_expertise,
    skill_proficiencies: data.skill_proficiencies,
    speed_burrow: data.speed_burrow,
    speed_climb: data.speed_climb,
    speed_fly: data.speed_fly,
    speed_swim: data.speed_swim,
    speed_walk: data.speed_walk,
    summoner_language_mode: data.summoner_language_mode,
    tag_ids: data.tag_ids,
    telepathy_range: data.telepathy_range,
    traits: createResourceFormDataI18nValue(data.traits, lang),
    tremorsense: data.tremorsense,
    truesight: data.truesight,
    type: data.type,
  });
}

//------------------------------------------------------------------------------
// Creature Form
//------------------------------------------------------------------------------

export const creatureForm = createForm("creature", creatureFormDataSchema.parse);
