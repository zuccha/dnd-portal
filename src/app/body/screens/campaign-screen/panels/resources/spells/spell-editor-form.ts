import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { characterClassSchema } from "~/models/types/character-class";
import { spellCastingTimeSchema } from "~/models/types/spell-casting-time";
import { spellDurationSchema } from "~/models/types/spell-duration";
import { spellRangeSchema } from "~/models/types/spell-range";
import { spellSchoolSchema } from "~/models/types/spell-school";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Spell Editor Form Fields
//------------------------------------------------------------------------------

export const spellEditorFormFieldsSchema = z.object({
  casting_time: spellCastingTimeSchema,
  casting_time_value: z.string(),
  character_classes: z.array(characterClassSchema),
  concentration: z.boolean(),
  description: z.string(),
  duration: spellDurationSchema,
  duration_value: z.string(),
  level: z.number(),
  material: z.boolean(),
  materials: z.string(),
  name: z.string(),
  range: spellRangeSchema,
  range_value_imp: z.string(),
  range_value_met: z.string(),
  ritual: z.boolean(),
  school: spellSchoolSchema,
  somatic: z.boolean(),
  upgrade: z.string(),
  verbal: z.boolean(),
  visibility: campaignRoleSchema,
});

export type SpellEditorFormFields = z.infer<typeof spellEditorFormFieldsSchema>;

//------------------------------------------------------------------------------
// Spell Editor Form
//------------------------------------------------------------------------------

export const spellEditorForm = createForm<SpellEditorFormFields>();

export const { useField: useSpellEditorFormField } = spellEditorForm;

export default spellEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useSpellEditorFormName = (
  defaultName: SpellEditorFormFields["name"],
) => useSpellEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Level
//------------------------------------------------------------------------------

function validateLevel(level: number) {
  return level >= 0 ? undefined : "level.error.empty";
}

export const useSpellEditorFormLevel = (
  defaultLevel: SpellEditorFormFields["level"],
) => useSpellEditorFormField("level", defaultLevel, validateLevel);

//------------------------------------------------------------------------------
// Character Classes
//------------------------------------------------------------------------------

export const useSpellEditorFormCharacterClasses = (
  defaultCharacterClasses: SpellEditorFormFields["character_classes"],
) => useSpellEditorFormField("character_classes", defaultCharacterClasses);

//------------------------------------------------------------------------------
// School
//------------------------------------------------------------------------------

export const useSpellEditorFormSchool = (
  defaultSchool: SpellEditorFormFields["school"],
) => useSpellEditorFormField("school", defaultSchool);

//------------------------------------------------------------------------------
// Casting Time
//------------------------------------------------------------------------------

export const useSpellEditorFormCastingTime = (
  defaultCastingTime: SpellEditorFormFields["casting_time"],
) => useSpellEditorFormField("casting_time", defaultCastingTime);

//------------------------------------------------------------------------------
// Casting Time Value
//------------------------------------------------------------------------------

export const useSpellEditorFormCastingTimeValue = (
  defaultCastingTimeValue: SpellEditorFormFields["casting_time_value"],
) => useSpellEditorFormField("casting_time_value", defaultCastingTimeValue);

//------------------------------------------------------------------------------
// Duration
//------------------------------------------------------------------------------

export const useSpellEditorFormDuration = (
  defaultDuration: SpellEditorFormFields["duration"],
) => useSpellEditorFormField("duration", defaultDuration);

//------------------------------------------------------------------------------
// Duration Value
//------------------------------------------------------------------------------

export const useSpellEditorFormDurationValue = (
  defaultDurationValue: SpellEditorFormFields["duration_value"],
) => useSpellEditorFormField("duration_value", defaultDurationValue);

//------------------------------------------------------------------------------
// Range
//------------------------------------------------------------------------------

export const useSpellEditorFormRange = (
  defaultRange: SpellEditorFormFields["range"],
) => useSpellEditorFormField("range", defaultRange);

//------------------------------------------------------------------------------
// Range Value Imp
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeValueImp = (
  defaultRangeValueImp: SpellEditorFormFields["range_value_imp"],
) => useSpellEditorFormField("range_value_imp", defaultRangeValueImp);

//------------------------------------------------------------------------------
// Range Value Met
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeValueMet = (
  defaultRangeValueMet: SpellEditorFormFields["range_value_met"],
) => useSpellEditorFormField("range_value_met", defaultRangeValueMet);

//------------------------------------------------------------------------------
// Materials
//------------------------------------------------------------------------------

function validateMaterials(materials: string) {
  return materials ? undefined : "materials.error.empty";
}

export const useSpellEditorFormMaterials = (
  defaultMaterials: SpellEditorFormFields["materials"],
) => useSpellEditorFormField("materials", defaultMaterials, validateMaterials);

//------------------------------------------------------------------------------
// Description
//------------------------------------------------------------------------------

function validateDescription(description: string) {
  return description ? undefined : "description.error.empty";
}

export const useSpellEditorFormDescription = (
  defaultDescription: SpellEditorFormFields["description"],
) =>
  useSpellEditorFormField(
    "description",
    defaultDescription,
    validateDescription,
  );

//------------------------------------------------------------------------------
// Upgrade
//------------------------------------------------------------------------------

export const useSpellEditorFormUpgrade = (
  defaultUpgrade: SpellEditorFormFields["upgrade"],
) => useSpellEditorFormField("upgrade", defaultUpgrade);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useSpellEditorFormVisibility = (
  defaultVisibility: SpellEditorFormFields["visibility"],
) => useSpellEditorFormField("visibility", defaultVisibility);
