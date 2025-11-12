import type { CampaignRole } from "../../../../../../resources/types/campaign-role";
import { type CharacterClass } from "../../../../../../resources/types/character-class";
import { type SpellCastingTime } from "../../../../../../resources/types/spell-casting-time";
import { type SpellDuration } from "../../../../../../resources/types/spell-duration";
import { type SpellRange } from "../../../../../../resources/types/spell-range";
import { type SpellSchool } from "../../../../../../resources/types/spell-school";
import { createForm } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type SpellEditorFormFields = {
  casting_time: SpellCastingTime;
  casting_time_value: string;
  character_classes: CharacterClass[];
  concentration: boolean;
  description: string;
  duration: SpellDuration;
  duration_value: string;
  level: number;
  material: boolean;
  materials: string;
  name: string;
  range: SpellRange;
  range_value_imp: string;
  range_value_met: string;
  ritual: boolean;
  school: SpellSchool;
  somatic: boolean;
  upgrade: string;
  verbal: boolean;
  visibility: CampaignRole;
};

export const spellEditorForm = createForm<SpellEditorFormFields>();

export const { useField: useSpellEditorFormField } = spellEditorForm;

export default spellEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useSpellEditorFormName = (defaultName: string) =>
  useSpellEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Level
//------------------------------------------------------------------------------

function validateLevel(level: number) {
  return level >= 0 ? undefined : "level.error.empty";
}

export const useSpellEditorFormLevel = (defaultLevel: number) =>
  useSpellEditorFormField("level", defaultLevel, validateLevel);

//------------------------------------------------------------------------------
// Character Classes
//------------------------------------------------------------------------------

export const useSpellEditorFormCharacterClasses = (
  defaultCharacterClasses: CharacterClass[],
) => useSpellEditorFormField("character_classes", defaultCharacterClasses);

//------------------------------------------------------------------------------
// School
//------------------------------------------------------------------------------

export const useSpellEditorFormSchool = (defaultSchool: SpellSchool) =>
  useSpellEditorFormField("school", defaultSchool);

//------------------------------------------------------------------------------
// Casting Time
//------------------------------------------------------------------------------

export const useSpellEditorFormCastingTime = (
  defaultCastingTime: SpellCastingTime,
) => useSpellEditorFormField("casting_time", defaultCastingTime);

//------------------------------------------------------------------------------
// Casting Time Value
//------------------------------------------------------------------------------

export const useSpellEditorFormCastingTimeValue = (
  defaultCastingTimeValue: string,
) => useSpellEditorFormField("casting_time_value", defaultCastingTimeValue);

//------------------------------------------------------------------------------
// Duration
//------------------------------------------------------------------------------

export const useSpellEditorFormDuration = (defaultDuration: SpellDuration) =>
  useSpellEditorFormField("duration", defaultDuration);

//------------------------------------------------------------------------------
// Duration Value
//------------------------------------------------------------------------------

export const useSpellEditorFormDurationValue = (defaultDurationValue: string) =>
  useSpellEditorFormField("duration_value", defaultDurationValue);

//------------------------------------------------------------------------------
// Range
//------------------------------------------------------------------------------

export const useSpellEditorFormRange = (defaultRange: SpellRange) =>
  useSpellEditorFormField("range", defaultRange);

//------------------------------------------------------------------------------
// Range Value Imp
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeValueImp = (defaultRangeValueImp: string) =>
  useSpellEditorFormField("range_value_imp", defaultRangeValueImp);

//------------------------------------------------------------------------------
// Range Value Met
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeValueMet = (defaultRangeValueMet: string) =>
  useSpellEditorFormField("range_value_met", defaultRangeValueMet);

//------------------------------------------------------------------------------
// Materials
//------------------------------------------------------------------------------

function validateMaterials(materials: string) {
  return materials ? undefined : "materials.error.empty";
}

export const useSpellEditorFormMaterials = (defaultMaterials: string) =>
  useSpellEditorFormField("materials", defaultMaterials, validateMaterials);

//------------------------------------------------------------------------------
// Description
//------------------------------------------------------------------------------

function validateDescription(description: string) {
  return description ? undefined : "description.error.empty";
}

export const useSpellEditorFormDescription = (defaultDescription: string) =>
  useSpellEditorFormField(
    "description",
    defaultDescription,
    validateDescription,
  );

//------------------------------------------------------------------------------
// Upgrade
//------------------------------------------------------------------------------

export const useSpellEditorFormUpgrade = (defaultUpgrade: string) =>
  useSpellEditorFormField("upgrade", defaultUpgrade);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useSpellEditorFormVisibility = (defaultVisibility: CampaignRole) =>
  useSpellEditorFormField("visibility", defaultVisibility);
