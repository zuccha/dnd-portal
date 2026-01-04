import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { armorTypeSchema } from "../../types/armor-type";
import { creatureAbilitySchema } from "../../types/creature-ability";
import { creatureSkillSchema } from "../../types/creature-skill";
import { dieTypeSchema } from "../../types/die_type";
import { weaponTypeSchema } from "../../types/weapon-type";
import {
  type TranslationFields,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";
import {
  startingEquipmentEntrySchema,
  startingEquipmentFromEntries,
} from "./starting-equipment";

//------------------------------------------------------------------------------
// Character Class
//------------------------------------------------------------------------------

export const characterClassSchema = resourceSchema
  .extend({
    armor_proficiencies: z.array(armorTypeSchema),
    armor_proficiencies_extra: i18nStringSchema,
    hp_die: dieTypeSchema,
    primary_abilities: z.array(creatureAbilitySchema),
    saving_throw_proficiencies: z.array(creatureAbilitySchema),
    skill_proficiencies_pool: z.array(creatureSkillSchema),
    skill_proficiencies_pool_quantity: z.number(),
    spell_ids: z.array(z.uuid()),
    starting_equipment_entries: z.array(startingEquipmentEntrySchema),
    tool_proficiency_ids: z.array(z.uuid()),
    weapon_proficiencies: z.array(weaponTypeSchema),
    weapon_proficiencies_extra: i18nStringSchema,
  })
  .transform(({ starting_equipment_entries, ...rest }) => ({
    ...rest,
    starting_equipment: startingEquipmentFromEntries(
      starting_equipment_entries,
    ),
  }));

export type CharacterClass = z.infer<typeof characterClassSchema>;

//------------------------------------------------------------------------------
// Default Character Class
//------------------------------------------------------------------------------

export const defaultCharacterClass: CharacterClass = {
  id: "",

  campaign_id: "",
  campaign_name: "",

  visibility: "game_master",

  name: {},
  page: {},

  armor_proficiencies: [],
  armor_proficiencies_extra: {},
  hp_die: "d8",
  primary_abilities: [],
  saving_throw_proficiencies: [],
  skill_proficiencies_pool: [],
  skill_proficiencies_pool_quantity: 2,
  spell_ids: [],
  starting_equipment: [],
  tool_proficiency_ids: [],
  weapon_proficiencies: [],
  weapon_proficiencies_extra: {},
};

//------------------------------------------------------------------------------
// Character Class Translation Fields
//------------------------------------------------------------------------------

export const characterClassTranslationFields: TranslationFields<CharacterClass>[] =
  [
    ...resourceTranslationFields,
    "armor_proficiencies_extra",
    "weapon_proficiencies_extra",
  ];
