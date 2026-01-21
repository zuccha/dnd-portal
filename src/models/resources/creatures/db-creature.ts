import z from "zod";
import { equipmentEntrySchema } from "../../other/equipment-bundle";
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
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Creature
//------------------------------------------------------------------------------

export const dbCreatureSchema = dbResourceSchema.extend({
  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_proficiencies: z.array(creatureAbilitySchema),
  ability_str: z.number(),
  ability_wis: z.number(),
  ac: z.number(),
  alignment: creatureAlignmentSchema,
  blindsight: z.number(),
  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),
  cr: creatureChallengeRatingSchema,
  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),
  darkvision: z.number(),
  equipment_entries: z.array(equipmentEntrySchema),
  habitats: z.array(creatureHabitatSchema),
  hp: z.number(),
  hp_formula: z.string(),
  initiative: z.number(),
  language_additional_count: z.number(),
  language_ids: z.array(z.uuid()),
  language_scope: languageScopeSchema,
  passive_perception: z.number(),
  plane_ids: z.array(z.uuid()),
  size: creatureSizeSchema,
  skill_expertise: z.array(creatureSkillSchema),
  skill_proficiencies: z.array(creatureSkillSchema),
  speed_burrow: z.number(),
  speed_climb: z.number(),
  speed_fly: z.number(),
  speed_swim: z.number(),
  speed_walk: z.number(),
  telepathy_range: z.number(),
  treasures: z.array(creatureTreasureSchema),
  tremorsense: z.number(),
  truesight: z.number(),
  type: creatureTypeSchema,
});

export type DBCreature = z.infer<typeof dbCreatureSchema>;

//------------------------------------------------------------------------------
// DB Creature Translation
//------------------------------------------------------------------------------

export const dbCreatureTranslationSchema = dbResourceTranslationSchema.extend({
  actions: z.string().nullish(),
  bonus_actions: z.string().nullish(),
  legendary_actions: z.string().nullish(),
  reactions: z.string().nullish(),
  traits: z.string().nullish(),
});

export type DBCreatureTranslation = z.infer<typeof dbCreatureTranslationSchema>;
