import type { CampaignRole } from "~/models/types/campaign-role";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type EldritchInvocationEditorFormFields = {
  name: string;
  min_warlock_level: number;
  description: string;
  prerequisite: string;
  visibility: CampaignRole;
};

export const eldritchInvocationEditorForm =
  createForm<EldritchInvocationEditorFormFields>();

export const { useField: useEldritchInvocationEditorFormField } =
  eldritchInvocationEditorForm;

export default eldritchInvocationEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useEldritchInvocationEditorFormName = (defaultName: string) =>
  useEldritchInvocationEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Min Warlock Level
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormMinWarlockLevel = (
  defaultMinWarlockLevel: number,
) =>
  useEldritchInvocationEditorFormField(
    "min_warlock_level",
    defaultMinWarlockLevel,
  );

//------------------------------------------------------------------------------
// Description
//------------------------------------------------------------------------------

function validateDescription(name: string) {
  return name ? undefined : "description.error.empty";
}

export const useEldritchInvocationEditorFormDescription = (
  defaultDescription: string,
) =>
  useEldritchInvocationEditorFormField(
    "description",
    defaultDescription,
    validateDescription,
  );

//------------------------------------------------------------------------------
// Prerequisite
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormPrerequisite = (
  defaultPrerequisite: string,
) => useEldritchInvocationEditorFormField("prerequisite", defaultPrerequisite);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useEldritchInvocationEditorFormVisibility = (
  defaultVisibility: CampaignRole,
) => useEldritchInvocationEditorFormField("visibility", defaultVisibility);
