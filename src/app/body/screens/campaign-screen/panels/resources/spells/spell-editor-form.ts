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
  page: z.number(),
  range: spellRangeSchema,
  range_value: z.number(),
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

export const spellEditorForm = createForm(
  "spell_editor",
  spellEditorFormFieldsSchema.parse,
);

export const { useField: useSpellEditorFormField } = spellEditorForm;

export default spellEditorForm;

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
// Character Classes
//------------------------------------------------------------------------------

export const useSpellEditorFormCharacterClasses = (
  defaultCharacterClasses: SpellEditorFormFields["character_classes"],
) => useSpellEditorFormField("character_classes", defaultCharacterClasses);

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
// Level
//------------------------------------------------------------------------------

function validateLevel(level: number) {
  return level >= 0 ? undefined : "level.error.empty";
}

export const useSpellEditorFormLevel = (
  defaultLevel: SpellEditorFormFields["level"],
) => useSpellEditorFormField("level", defaultLevel, validateLevel);

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
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useSpellEditorFormName = (
  defaultName: SpellEditorFormFields["name"],
) => useSpellEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useSpellEditorFormPage = (
  defaultPage: SpellEditorFormFields["page"],
) => useSpellEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Range
//------------------------------------------------------------------------------

export const useSpellEditorFormRange = (
  defaultRange: SpellEditorFormFields["range"],
) => useSpellEditorFormField("range", defaultRange);

//------------------------------------------------------------------------------
// Range Value
//------------------------------------------------------------------------------

export const useSpellEditorFormRangeValue = (
  defaultRangeValue: SpellEditorFormFields["range_value"],
) => useSpellEditorFormField("range_value", defaultRangeValue);

//------------------------------------------------------------------------------
// School
//------------------------------------------------------------------------------

export const useSpellEditorFormSchool = (
  defaultSchool: SpellEditorFormFields["school"],
) => useSpellEditorFormField("school", defaultSchool);

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
