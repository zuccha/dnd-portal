import z from "zod";
import { createForm } from "~/utils/form";
import { armorTypeSchema } from "../../types/armor-type";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { dieTypeSchema } from "../../types/die_type";
import { weaponTypeSchema } from "../../types/weapon-type";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import {
  type DBCharacterClass,
  type DBCharacterClassTranslation,
} from "./db-character-class";
import {
  startingEquipmentGroupSchema,
  startingEquipmentToEntries,
} from "./starting-equipment";

//------------------------------------------------------------------------------
// Character Class Form Data
//------------------------------------------------------------------------------

export const characterClassFormDataSchema = resourceFormDataSchema.extend({
  armor_proficiencies: z.array(armorTypeSchema),
  armor_proficiencies_extra: z.string(),
  hp_die: dieTypeSchema,
  primary_abilities: z.array(creatureAbilitySchema),
  saving_throw_proficiencies: z.array(creatureAbilitySchema),
  skill_proficiencies_pool: z.array(creatureSkillSchema),
  skill_proficiencies_pool_quantity: z.number(),
  spell_ids: z.array(z.uuid()),
  starting_equipment: z.array(startingEquipmentGroupSchema),
  tool_proficiency_ids: z.array(z.uuid()),
  weapon_proficiencies: z.array(weaponTypeSchema),
  weapon_proficiencies_extra: z.string(),
});

export type CharacterClassFormData = z.infer<
  typeof characterClassFormDataSchema
>;

//------------------------------------------------------------------------------
// Character Class Form Data To DB
//------------------------------------------------------------------------------

export function characterClassFormDataToDB(
  data: Partial<CharacterClassFormData>,
): {
  resource: Partial<DBCharacterClass>;
  translation: Partial<DBCharacterClassTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      armor_proficiencies: data.armor_proficiencies,
      hp_die: data.hp_die,
      primary_abilities: data.primary_abilities,
      saving_throw_proficiencies: data.saving_throw_proficiencies,
      skill_proficiencies_pool: data.skill_proficiencies_pool,
      skill_proficiencies_pool_quantity: data.skill_proficiencies_pool_quantity,
      spell_ids: data.spell_ids,
      starting_equipment_entries:
        data.starting_equipment ?
          startingEquipmentToEntries(data.starting_equipment)
        : undefined,
      tool_proficiency_ids: data.tool_proficiency_ids,
      weapon_proficiencies: data.weapon_proficiencies,
    },
    translation: {
      ...translation,
      armor_proficiencies_extra: data.armor_proficiencies_extra,
      weapon_proficiencies_extra: data.weapon_proficiencies_extra,
    },
  };
}

//------------------------------------------------------------------------------
// Character Class Form
//------------------------------------------------------------------------------

export const characterClassForm = createForm(
  "character_class",
  characterClassFormDataSchema.parse,
);
