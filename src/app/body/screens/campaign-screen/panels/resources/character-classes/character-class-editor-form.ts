import { z } from "zod";
import { startingEquipmentGroupSchema } from "~/models/resources/character-classes/starting-equipment";
import { armorTypeSchema } from "~/models/types/armor-type";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { creatureAbilitySchema } from "~/models/types/creature-ability";
import { creatureSkillSchema } from "~/models/types/creature-skill";
import { dieTypeSchema } from "~/models/types/die_type";
import { weaponTypeSchema } from "~/models/types/weapon-type";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Character Class Editor Form Fields
//------------------------------------------------------------------------------

export const characterClassEditorFormFieldsSchema = z.object({
  name: z.string(),
  page: z.number(),
  visibility: campaignRoleSchema,

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

export type CharacterClassEditorFormFields = z.infer<
  typeof characterClassEditorFormFieldsSchema
>;

//------------------------------------------------------------------------------
// Character Class Editor Form
//------------------------------------------------------------------------------

export const characterClassEditorForm = createForm(
  "character_class_editor",
  characterClassEditorFormFieldsSchema.parse,
);

export const { useField: useCharacterClassEditorFormField } =
  characterClassEditorForm;

export default characterClassEditorForm;

//------------------------------------------------------------------------------
// Armor Proficiencies
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormArmorProficiencies = (
  defaultArmorProficiencies: CharacterClassEditorFormFields["armor_proficiencies"],
) =>
  useCharacterClassEditorFormField(
    "armor_proficiencies",
    defaultArmorProficiencies,
  );

//------------------------------------------------------------------------------
// Armor Proficiencies Extra
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormArmorProficienciesExtra = (
  defaultArmorProficienciesExtra: CharacterClassEditorFormFields["armor_proficiencies_extra"],
) =>
  useCharacterClassEditorFormField(
    "armor_proficiencies_extra",
    defaultArmorProficienciesExtra,
  );

//------------------------------------------------------------------------------
// Hp Die
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormHpDie = (
  defaultHpDie: CharacterClassEditorFormFields["hp_die"],
) => useCharacterClassEditorFormField("hp_die", defaultHpDie);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useCharacterClassEditorFormName = (
  defaultName: CharacterClassEditorFormFields["name"],
) => useCharacterClassEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormPage = (
  defaultPage: CharacterClassEditorFormFields["page"],
) => useCharacterClassEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Primary Abilities
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormPrimaryAbilities = (
  defaultPrimaryAbilities: CharacterClassEditorFormFields["primary_abilities"],
) =>
  useCharacterClassEditorFormField(
    "primary_abilities",
    defaultPrimaryAbilities,
  );

//------------------------------------------------------------------------------
// Saving Throw Proficiencies
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormSavingThrowProficiencies = (
  defaultSavingThrowProficiencies: CharacterClassEditorFormFields["saving_throw_proficiencies"],
) =>
  useCharacterClassEditorFormField(
    "saving_throw_proficiencies",
    defaultSavingThrowProficiencies,
  );

//------------------------------------------------------------------------------
// Skill Proficiencies Pool
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormSkillProficienciesPool = (
  defaultSkillProficienciesPool: CharacterClassEditorFormFields["skill_proficiencies_pool"],
) =>
  useCharacterClassEditorFormField(
    "skill_proficiencies_pool",
    defaultSkillProficienciesPool,
  );

//------------------------------------------------------------------------------
// Skill Proficiencies Pool Quantity
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormSkillProficienciesPoolQuantity = (
  defaultSkillProficienciesPoolQuantity: CharacterClassEditorFormFields["skill_proficiencies_pool_quantity"],
) =>
  useCharacterClassEditorFormField(
    "skill_proficiencies_pool_quantity",
    defaultSkillProficienciesPoolQuantity,
  );

//------------------------------------------------------------------------------
// Spell Ids
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormSpellIds = (
  defaultSpellIds: CharacterClassEditorFormFields["spell_ids"],
) => useCharacterClassEditorFormField("spell_ids", defaultSpellIds);

//------------------------------------------------------------------------------
// Starting Equipment
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormStartingEquipment = (
  defaultStartingEquipment: CharacterClassEditorFormFields["starting_equipment"],
) =>
  useCharacterClassEditorFormField(
    "starting_equipment",
    defaultStartingEquipment,
  );

//------------------------------------------------------------------------------
// Tool Proficiency Ids
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormToolProficiencyIds = (
  defaultToolProficiencyIds: CharacterClassEditorFormFields["tool_proficiency_ids"],
) =>
  useCharacterClassEditorFormField(
    "tool_proficiency_ids",
    defaultToolProficiencyIds,
  );

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormVisibility = (
  defaultVisibility: CharacterClassEditorFormFields["visibility"],
) => useCharacterClassEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Weapon Proficiencies
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormWeaponProficiencies = (
  defaultWeaponProficiencies: CharacterClassEditorFormFields["weapon_proficiencies"],
) =>
  useCharacterClassEditorFormField(
    "weapon_proficiencies",
    defaultWeaponProficiencies,
  );

//------------------------------------------------------------------------------
// Weapon Proficiencies Extra
//------------------------------------------------------------------------------

export const useCharacterClassEditorFormWeaponProficienciesExtra = (
  defaultWeaponProficienciesExtra: CharacterClassEditorFormFields["weapon_proficiencies_extra"],
) =>
  useCharacterClassEditorFormField(
    "weapon_proficiencies_extra",
    defaultWeaponProficienciesExtra,
  );
