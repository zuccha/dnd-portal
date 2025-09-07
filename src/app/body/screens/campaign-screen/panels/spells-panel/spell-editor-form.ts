import {
  type DistanceImpUnit,
  type DistanceMetUnit,
} from "../../../../../../i18n/i18n-distance";
import { type CharacterClass } from "../../../../../../resources/character-class";
import {
  spellSchema,
  spellTranslationSchema,
  updateSpell,
} from "../../../../../../resources/spell";
import { type SpellCastingTime } from "../../../../../../resources/spell-casting-time";
import { type SpellDuration } from "../../../../../../resources/spell-duration";
import { type SpellRange } from "../../../../../../resources/spell-range";
import { type SpellSchool } from "../../../../../../resources/spell-school";
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
  range_imp_unit: DistanceImpUnit;
  range_imp_value: number;
  range_met_unit: DistanceMetUnit;
  range_met_value: number;
  ritual: boolean;
  school: SpellSchool;
  somatic: boolean;
  upgrade: string;
  verbal: boolean;
};

export const spellEditorForm = createForm<
  SpellEditorFormFields,
  { id: string; lang: string }
>(async (data, { lang, id }) => {
  const maybeSpell = {
    casting_time: data.casting_time,
    casting_time_value: data.casting_time,
    character_classes: data.character_classes,
    concentration: data.concentration,
    duration: data.duration,
    duration_value: data.duration_value,
    level: data.level,
    material: data.material,
    range: data.range,
    range_value_imp:
      data.range_imp_value && data.range_imp_unit
        ? `${data.range_imp_value} ${data.range_imp_unit}`
        : undefined,
    range_value_met:
      data.range_met_value && data.range_met_unit
        ? `${data.range_met_value} ${data.range_met_unit}`
        : undefined,
    ritual: data.ritual,
    school: data.school,
    somatic: data.somatic,
    verbal: data.verbal,
  };

  const maybeLocale = {
    description: data.description,
    lang,
    materials: data.materials,
    name: data.name,
    spell_id: id,
    upgrade: data.upgrade,
  };

  const report = (error: Error, message: string) => {
    console.error(error);
    return message;
  };

  const spell = spellSchema.partial().safeParse(maybeSpell);
  if (!spell.success) return report(spell.error, "form.error.invalid_spell");

  const translation = spellTranslationSchema.safeParse(maybeLocale);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  const response = await updateSpell(id, spell.data, translation.data);
  if (response.error) report(response.error, "form.error.update_spell_failure");

  return undefined;
});

export const {
  useField: useSpellEditorFormField,
  useSubmitError: useSpellEditorFormSubmitError,
} = spellEditorForm;

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
  defaultCharacterClasses: CharacterClass[]
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
  defaultCastingTime: SpellCastingTime
) => useSpellEditorFormField("casting_time", defaultCastingTime);

//------------------------------------------------------------------------------
// Casting Time Value
//------------------------------------------------------------------------------

export const useSpellEditorFormCastingTimeValue = (
  defaultCastingTimeValue: string
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
// Range Imp Value
//------------------------------------------------------------------------------

function validateRangeImpValue(rangeImpValue: number) {
  return rangeImpValue >= 0 ? undefined : "range_imp_value.error.invalid";
}

export const useSpellEditorFormRangeImpValue = (defaultRangeImpValue: number) =>
  useSpellEditorFormField(
    "range_imp_value",
    defaultRangeImpValue,
    validateRangeImpValue
  );

//------------------------------------------------------------------------------
// Range Imp Unit
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeImpUnit = (
  defaultRangeImpUnit: DistanceImpUnit
) => useSpellEditorFormField("range_imp_unit", defaultRangeImpUnit);

//------------------------------------------------------------------------------
// Range Met Value
//------------------------------------------------------------------------------

function validateRangeMetValue(rangeMetValue: number) {
  return rangeMetValue >= 0 ? undefined : "range_met_value.error.invalid";
}

export const useSpellEditorFormRangeMetValue = (defaultRangeMetValue: number) =>
  useSpellEditorFormField(
    "range_met_value",
    defaultRangeMetValue,
    validateRangeMetValue
  );

//------------------------------------------------------------------------------
// Range Met Unit
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeMetUnit = (
  defaultRangeMetUnit: DistanceMetUnit
) => useSpellEditorFormField("range_met_unit", defaultRangeMetUnit);

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
    validateDescription
  );

//------------------------------------------------------------------------------
// Upgrade
//------------------------------------------------------------------------------

export const useSpellEditorFormUpgrade = (defaultUpgrade: string) =>
  useSpellEditorFormField("upgrade", defaultUpgrade);
