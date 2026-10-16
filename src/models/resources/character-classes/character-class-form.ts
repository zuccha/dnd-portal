import z from "zod";
import { createForm } from "~/utils/form";
import { equipmentBundleSchema } from "../../other/equipment-bundle";
import { armorTypeSchema } from "../../types/armor-type";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { dieTypeSchema } from "../../types/die_type";
import { weaponTypeSchema } from "../../types/weapon-type";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  createIdRelationEndpointUpdates,
  createRelationEndpointUpdates,
  type ResourceFormOutput,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { CharacterClass } from "./character-class";

//------------------------------------------------------------------------------
// Character Class Form Data
//------------------------------------------------------------------------------

export const characterClassFormDataSchema = resourceFormDataSchema.extend({
  abbreviation: z.string().default(""),
  armor_proficiencies: z.array(armorTypeSchema).default([]),
  armor_proficiencies_extra: z.string().default(""),
  feature_entries: z.array(featureEntrySchema).default([]),
  hit_point_die: dieTypeSchema.default("d8"),
  primary_abilities: z.array(creatureAbilitySchema).default([]),
  saving_throw_proficiencies: z.array(creatureAbilitySchema).default([]),
  skill_proficiencies_pool: z.array(creatureSkillSchema).default([]),
  skill_proficiencies_pool_quantity: z.number().default(2),
  spell_ids: z.array(z.uuid()).default([]),
  starting_equipment: z.array(z.array(equipmentBundleSchema)).default([]),
  tool_proficiency_ids: z.array(z.uuid()).default([]),
  weapon_proficiencies: z.array(weaponTypeSchema).default([]),
  weapon_proficiencies_extra: z.string().default(""),
});

export type CharacterClassFormData = z.infer<typeof characterClassFormDataSchema>;

//------------------------------------------------------------------------------
// Character Class Form Data To Resource
//------------------------------------------------------------------------------

export function characterClassFormDataToResource(
  data: Partial<CharacterClassFormData>,
  lang: string,
): ResourceFormOutput<CharacterClass> {
  const { feature_entries, spell_ids, ...resourceData } = data;
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(resourceData, lang),
    abbreviation: createResourceFormDataI18nValue(data.abbreviation, lang),
    armor_proficiencies: data.armor_proficiencies,
    armor_proficiencies_extra: createResourceFormDataI18nValue(
      data.armor_proficiencies_extra,
      lang,
    ),
    hit_point_die: data.hit_point_die,
    primary_abilities: data.primary_abilities,
    saving_throw_proficiencies: data.saving_throw_proficiencies,
    skill_proficiencies_pool: data.skill_proficiencies_pool,
    skill_proficiencies_pool_quantity: data.skill_proficiencies_pool_quantity,
    starting_equipment: data.starting_equipment,
    tool_proficiency_ids: data.tool_proficiency_ids,
    weapon_proficiencies: data.weapon_proficiencies,
    weapon_proficiencies_extra: createResourceFormDataI18nValue(
      data.weapon_proficiencies_extra,
      lang,
    ),
  });
  const relations = [
    ...createRelationEndpointUpdates("character_classes_and_features", feature_entries),
    ...createIdRelationEndpointUpdates("character_classes_and_spells", spell_ids),
  ];
  return { resource, relations } satisfies ResourceFormOutput<CharacterClass>;
}

//------------------------------------------------------------------------------
// Character Class Form
//------------------------------------------------------------------------------

export const characterClassForm = createForm("character_class", characterClassFormDataSchema.parse);
