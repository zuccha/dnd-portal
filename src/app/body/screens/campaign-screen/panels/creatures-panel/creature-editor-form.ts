import type { CampaignRole } from "../../../../../../resources/types/campaign-role";
import { createForm } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Creature Editor Form Fields
//------------------------------------------------------------------------------

export type CreatureEditorFormFields = {
  name: string;
  visibility: CampaignRole;
};

//------------------------------------------------------------------------------
// Creature Editor Form
//------------------------------------------------------------------------------

const creatureEditorForm = createForm<CreatureEditorFormFields>();

export const { useField: useCreatureEditorFormField } = creatureEditorForm;

export default creatureEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useCreatureEditorFormName = (defaultName: string) =>
  useCreatureEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useCreatureEditorFormVisibility = (
  defaultVisibility: CampaignRole,
) => useCreatureEditorFormField("visibility", defaultVisibility);
