import {
  distanceImpUnits,
  distanceMetUnits,
} from "../../../../../../i18n/i18n-distance";
import { timeUnits } from "../../../../../../i18n/i18n-time";
import { type CharacterClass } from "../../../../../../resources/character-class";
import {
  spellLocaleSchema,
  spellSchema,
  updateSpell,
  updateSpellLocale,
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
  casting_time_unit: string;
  casting_time_value: number;
  character_classes: CharacterClass[];
  concentration: boolean;
  description: string;
  duration: SpellDuration;
  duration_unit: string;
  duration_value: number;
  level: number;
  material: boolean;
  materials: string;
  name: string;
  range: SpellRange;
  range_imp_unit: string;
  range_imp_value: number;
  range_met_unit: string;
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
    casting_time_value:
      data.casting_time_value && data.casting_time_unit
        ? `${data.casting_time_value} ${data.casting_time_unit}`
        : undefined,
    character_classes: data.character_classes,
    concentration: data.concentration,
    duration: data.duration,
    duration_value:
      data.duration_value && data.duration_unit
        ? `${data.duration_value} ${data.duration_unit}`
        : undefined,
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

  const locale = spellLocaleSchema.safeParse(maybeLocale);
  if (!locale.success) return report(locale.error, "form.error.invalid_locale");

  const res1 = await updateSpell(id, spell.data);
  if (res1.error) report(res1.error, "form.error.update_spell_failure");

  const res2 = await updateSpellLocale(locale.data);
  if (res2.error) report(res2.error, "form.error.update_locale_failure");

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

function validateCastingTimeValue(castingTimeValue: number) {
  return castingTimeValue >= 0 ? undefined : "casting_time_value.error.invalid";
}

export const useSpellEditorFormCastingTimeValue = (
  defaultCastingTimeValue: number
) =>
  useSpellEditorFormField(
    "casting_time_value",
    defaultCastingTimeValue,
    validateCastingTimeValue
  );

//------------------------------------------------------------------------------
// Casting Time Unit
//------------------------------------------------------------------------------

function validateCastingTimeUnit(castingTimeUnit: string) {
  return castingTimeUnit
    ? timeUnits.includes(castingTimeUnit)
      ? undefined
      : "casting_time_unit.error.invalid"
    : "casting_time_unit.error.empty";
}

export const useSpellEditorFormCastingTimeUnit = (
  defaultCastingTimeUnit: string
) =>
  useSpellEditorFormField(
    "casting_time_unit",
    defaultCastingTimeUnit,
    validateCastingTimeUnit
  );

//------------------------------------------------------------------------------
// Duration
//------------------------------------------------------------------------------

export const useSpellEditorFormDuration = (defaultDuration: SpellDuration) =>
  useSpellEditorFormField("duration", defaultDuration);

//------------------------------------------------------------------------------
// Duration Value
//------------------------------------------------------------------------------

function validateDurationValue(durationValue: number) {
  return durationValue >= 0 ? undefined : "duration_value.error.invalid";
}

export const useSpellEditorFormDurationValue = (defaultDurationValue: number) =>
  useSpellEditorFormField(
    "duration_value",
    defaultDurationValue,
    validateDurationValue
  );

//------------------------------------------------------------------------------
// Duration Unit
//------------------------------------------------------------------------------

function validateDurationUnit(durationUnit: string) {
  return durationUnit
    ? timeUnits.includes(durationUnit)
      ? undefined
      : "duration_unit.error.invalid"
    : "duration_unit.error.empty";
}

export const useSpellEditorFormDurationUnit = (defaultDurationUnit: string) =>
  useSpellEditorFormField(
    "duration_unit",
    defaultDurationUnit,
    validateDurationUnit
  );

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

function validateRangeImpUnit(rangeImpUnit: string) {
  return rangeImpUnit
    ? distanceImpUnits.includes(rangeImpUnit)
      ? undefined
      : "range_imp_unit.error.invalid"
    : "range_imp_unit.error.empty";
}

export const useSpellEditorFormRangeImpUnit = (defaultRangeImpUnit: string) =>
  useSpellEditorFormField(
    "range_imp_unit",
    defaultRangeImpUnit,
    validateRangeImpUnit
  );

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

function validateRangeMetUnit(rangeMetUnit: string) {
  return rangeMetUnit
    ? distanceMetUnits.includes(rangeMetUnit)
      ? undefined
      : "range_met_unit.error.invalid"
    : "range_met_unit.error.empty";
}

export const useSpellEditorFormRangeMetUnit = (defaultRangeMetUnit: string) =>
  useSpellEditorFormField(
    "range_met_unit",
    defaultRangeMetUnit,
    validateRangeMetUnit
  );

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
