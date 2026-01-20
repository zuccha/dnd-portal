import z from "zod";
import { createForm } from "~/utils/form";
import {
  equipmentBundleSchema,
  equipmentBundleToEntries,
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
import { languageScopeSchema } from "../../types/language-scope";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBCreature, type DBCreatureTranslation } from "./db-creature";

//------------------------------------------------------------------------------
// Creature Form Data
//------------------------------------------------------------------------------

export const creatureFormDataSchema = resourceFormDataSchema.extend({
  ability_cha: z.number(),
  ability_con: z.number(),
  ability_dex: z.number(),
  ability_int: z.number(),
  ability_proficiencies: z.array(creatureAbilitySchema),
  ability_str: z.number(),
  ability_wis: z.number(),
  ac: z.number(),
  actions: z.string(),
  alignment: creatureAlignmentSchema,
  blindsight: z.number(),
  bonus_actions: z.string(),
  condition_immunities: z.array(creatureConditionSchema),
  condition_resistances: z.array(creatureConditionSchema),
  condition_vulnerabilities: z.array(creatureConditionSchema),
  cr: z.number(),
  damage_immunities: z.array(damageTypeSchema),
  damage_resistances: z.array(damageTypeSchema),
  damage_vulnerabilities: z.array(damageTypeSchema),
  darkvision: z.number(),
  gear: equipmentBundleSchema,
  habitats: z.array(creatureHabitatSchema),
  hp: z.number(),
  hp_formula: z.string(),
  initiative: z.number(),
  language_additional_count: z.number(),
  language_ids: z.array(z.uuid()),
  language_scope: languageScopeSchema,
  legendary_actions: z.string(),
  passive_perception: z.number(),
  plane_ids: z.array(z.uuid()),
  reactions: z.string(),
  size: creatureSizeSchema,
  skill_expertise: z.array(creatureSkillSchema),
  skill_proficiencies: z.array(creatureSkillSchema),
  speed_burrow: z.number(),
  speed_climb: z.number(),
  speed_fly: z.number(),
  speed_swim: z.number(),
  speed_walk: z.number(),
  telepathy_range: z.number(),
  traits: z.string(),
  treasures: z.array(creatureTreasureSchema),
  tremorsense: z.number(),
  truesight: z.number(),
  type: creatureTypeSchema,
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
      hp: data.hp,
      hp_formula: data.hp_formula,
      initiative: data.initiative,
      language_additional_count: data.language_additional_count,
      language_ids: data.language_ids,
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
