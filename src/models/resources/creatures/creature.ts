import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
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
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Creature
//------------------------------------------------------------------------------

export const creatureBaseSchema = resourceSchema.extend({
  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_proficiencies: z.array(creatureAbilitySchema),
  ability_str: z.number(),
  ability_wis: z.number(),
  actions: i18nStringSchema,
  additional_hp_per_level: z.number().default(0),
  additional_hp_starting_from_level: z.number().default(0),
  adds_spell_level_to_armor_class: z.boolean().default(false),
  alignment: creatureAlignmentSchema,
  armor_class: z.number(),
  blindsight: z.number(),
  bonus_actions: i18nStringSchema,
  can_hover: z.boolean(),
  challenge_rating: creatureChallengeRatingSchema,
  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),
  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),
  darkvision: z.number(),
  experience_points: z.number(),
  family_id: z.uuid().nullable(),
  has_lair: z.boolean(),
  hit_points: z.number(),
  hit_points_formula: z.string(),
  initiative: z.number(),
  is_summoned_from_spell: z.boolean().default(false),
  kind: z.literal("creature"),
  lair_effects: i18nStringSchema,
  lair_experience_points: z.number(),
  lair_legendary_actions_count: z.number(),
  language_additional_count: z.number(),
  language_entries: z.array(languageEntrySchema),
  language_scope: languageScopeSchema,
  legendary_actions: i18nStringSchema,
  legendary_actions_count: z.number(),
  passive_perception: z.number(),
  proficiency_bonus: z.number(),
  reactions: i18nStringSchema,
  sizes: z.array(creatureSizeSchema).min(1),
  skill_expertise: z.array(creatureSkillSchema),
  skill_proficiencies: z.array(creatureSkillSchema),
  speed_burrow: z.number(),
  speed_climb: z.number(),
  speed_fly: z.number(),
  speed_swim: z.number(),
  speed_walk: z.number(),
  summoner_language_mode: summonerLanguageModeSchema.default("none"),
  tag_ids: z.array(z.uuid()),
  telepathy_range: z.number(),
  traits: i18nStringSchema,
  tremorsense: z.number(),
  truesight: z.number(),
  type: creatureTypeSchema,
});

export const creatureSchema = creatureBaseSchema.extend({
  gear: equipmentBundleSchema,
});

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
  actions: {},
  additional_hp_per_level: 0,
  additional_hp_starting_from_level: 0,
  adds_spell_level_to_armor_class: false,
  alignment: "true_neutral",
  armor_class: 10,
  blindsight: 0,
  bonus_actions: {},
  can_hover: false,
  challenge_rating: 0,
  condition_immunities: [],
  condition_resistances: [],
  condition_vulnerabilities: [],
  damage_immunities: [],
  damage_resistances: [],
  damage_vulnerabilities: [],
  darkvision: 0,
  experience_points: 0,
  family_id: null,
  gear: defaultEquipmentBundle,
  has_lair: false,
  hit_points: 11,
  hit_points_formula: "2d10",
  initiative: 0,
  is_summoned_from_spell: false,
  kind: "creature",
  lair_effects: {},
  lair_experience_points: 25,
  lair_legendary_actions_count: 0,
  language_additional_count: 0,
  language_entries: [],
  language_scope: "specific",
  legendary_actions: {},
  legendary_actions_count: 0,
  passive_perception: 10,
  proficiency_bonus: 2,
  reactions: {},
  sizes: ["medium"],
  skill_expertise: [],
  skill_proficiencies: [],
  speed_burrow: 0,
  speed_climb: 0,
  speed_fly: 0,
  speed_swim: 0,
  speed_walk: 0,
  summoner_language_mode: "none",
  tag_ids: [],
  telepathy_range: 0,
  traits: {},
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
  "legendary_actions",
  "reactions",
  "lair_effects",
  "traits",
];
