import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Form Fields
//------------------------------------------------------------------------------

export const eldritchInvocationEditorFormFieldsSchema = z.object({
  description: z.string(),
  min_warlock_level: z.number(),
  name: z.string(),
  page: z.number(),
  prerequisite: z.string(),
  visibility: campaignRoleSchema,
});

export type EldritchInvocationEditorFormFields = z.infer<
  typeof eldritchInvocationEditorFormFieldsSchema
>;

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Form
//------------------------------------------------------------------------------

export const eldritchInvocationEditorForm = createForm(
  "eldritch_invocation_editor",
  eldritchInvocationEditorFormFieldsSchema.parse,
);

export const { useField: useEldritchInvocationEditorFormField } =
  eldritchInvocationEditorForm;

export default eldritchInvocationEditorForm;

//------------------------------------------------------------------------------
// Description
//------------------------------------------------------------------------------

function validateDescription(name: string) {
  return name ? undefined : "description.error.empty";
}

export const useEldritchInvocationEditorFormDescription = (
  defaultDescription: EldritchInvocationEditorFormFields["description"],
) =>
  useEldritchInvocationEditorFormField(
    "description",
    defaultDescription,
    validateDescription,
  );

//------------------------------------------------------------------------------
// Min Warlock Level
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormMinWarlockLevel = (
  defaultMinWarlockLevel: EldritchInvocationEditorFormFields["min_warlock_level"],
) =>
  useEldritchInvocationEditorFormField(
    "min_warlock_level",
    defaultMinWarlockLevel,
  );

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useEldritchInvocationEditorFormName = (defaultName: string) =>
  useEldritchInvocationEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormPage = (
  defaultPage: EldritchInvocationEditorFormFields["page"],
) => useEldritchInvocationEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Prerequisite
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormPrerequisite = (
  defaultPrerequisite: EldritchInvocationEditorFormFields["prerequisite"],
) => useEldritchInvocationEditorFormField("prerequisite", defaultPrerequisite);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormVisibility = (
  defaultVisibility: EldritchInvocationEditorFormFields["visibility"],
) => useEldritchInvocationEditorFormField("visibility", defaultVisibility);
