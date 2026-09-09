import z from "zod";
import { createForm } from "~/utils/form";
import { armorTypeSchema } from "../../types/armor-type";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { dieTypeSchema } from "../../types/die_type";
import { weaponTypeSchema } from "../../types/weapon-type";
import { featureEntrySchema } from "../features/feature-entry";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { CharacterClass } from "./character-class";
import { startingEquipmentGroupSchema } from "./starting-equipment";

//------------------------------------------------------------------------------
// Character Class Form Data
//------------------------------------------------------------------------------

export const characterClassFormDataSchema = resourceFormDataSchema.extend({
  armor_proficiencies: z.array(armorTypeSchema).default([]),
  armor_proficiencies_extra: z.string().default(""),
  feature_entries: z.array(featureEntrySchema).default([]),
  hp_die: dieTypeSchema.default("d8"),
  primary_abilities: z.array(creatureAbilitySchema).default([]),
  saving_throw_proficiencies: z.array(creatureAbilitySchema).default([]),
  skill_proficiencies_pool: z.array(creatureSkillSchema).default([]),
  skill_proficiencies_pool_quantity: z.number().default(2),
  spell_ids: z.array(z.uuid()).default([]),
  starting_equipment: z.array(startingEquipmentGroupSchema).default([]),
  tool_proficiency_ids: z.array(z.uuid()).default([]),
  weapon_proficiencies: z.array(weaponTypeSchema).default([]),
  weapon_proficiencies_extra: z.string().default(""),
});

export type CharacterClassFormData = z.infer<
  typeof characterClassFormDataSchema
>;

//------------------------------------------------------------------------------
// Character Class Form Data To Resource
//------------------------------------------------------------------------------

export function characterClassFormDataToResource(
  data: Partial<CharacterClassFormData>,
  lang: string,
): Partial<CharacterClass> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    armor_proficiencies: data.armor_proficiencies,
    armor_proficiencies_extra: createResourceFormDataI18nValue(
      data.armor_proficiencies_extra,
      lang,
    ),
    feature_entries: data.feature_entries,
    hp_die: data.hp_die,
    primary_abilities: data.primary_abilities,
    saving_throw_proficiencies: data.saving_throw_proficiencies,
    skill_proficiencies_pool: data.skill_proficiencies_pool,
    skill_proficiencies_pool_quantity: data.skill_proficiencies_pool_quantity,
    spell_ids: data.spell_ids,
    starting_equipment: data.starting_equipment,
    tool_proficiency_ids: data.tool_proficiency_ids,
    weapon_proficiencies: data.weapon_proficiencies,
    weapon_proficiencies_extra: createResourceFormDataI18nValue(
      data.weapon_proficiencies_extra,
      lang,
    ),
  });
}

//------------------------------------------------------------------------------
// Character Class Form
//------------------------------------------------------------------------------

export const characterClassForm = createForm(
  "character_class",
  characterClassFormDataSchema.parse,
);
