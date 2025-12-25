import z from "zod";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { creatureConditionSchema } from "../../types/creature-condition";
import { creatureHabitatSchema } from "../../types/creature-habitat";
import { creatureSizeSchema } from "../../types/creature-size";
import { creatureSkillSchema } from "../../types/creature-skill";
import { creatureTreasureSchema } from "../../types/creature-treasure";
import { creatureTypeSchema } from "../../types/creature-type";
import { damageTypeSchema } from "../../types/damage-type";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Creature
//------------------------------------------------------------------------------

export const dbCreatureSchema = dbResourceSchema.extend({
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
});

export type DBCreature = z.infer<typeof dbCreatureSchema>;

//------------------------------------------------------------------------------
// DB Creature Translation
//------------------------------------------------------------------------------

export const dbCreatureTranslationSchema = dbResourceTranslationSchema.extend({
  gear: z.string().nullish(),
  languages: z.string().nullish(),
  planes: z.string().nullish(),
  senses: z.string().nullish(),

  actions: z.string().nullish(),
  bonus_actions: z.string().nullish(),
  legendary_actions: z.string().nullish(),
  reactions: z.string().nullish(),
  traits: z.string().nullish(),
});

export type DBCreatureTranslation = z.infer<typeof dbCreatureTranslationSchema>;
