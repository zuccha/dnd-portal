import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { creatureAbilitySchema } from "~/models/types/creature-ability";
import { toolTypeSchema } from "~/models/types/tool-type";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Tool Editor Form Fields
//------------------------------------------------------------------------------

export const toolEditorFormFieldsSchema = z.object({
  ability: creatureAbilitySchema,
  cost: z.number(),
  craft: z.string(),
  magic: z.boolean(),
  name: z.string(),
  notes: z.string(),
  page: z.number(),
  type: toolTypeSchema,
  utilize: z.string(),
  visibility: campaignRoleSchema,
  weight: z.number(),
});

export type ToolEditorFormFields = z.infer<typeof toolEditorFormFieldsSchema>;

//------------------------------------------------------------------------------
// Tool Editor Form
//------------------------------------------------------------------------------

export const toolEditorForm = createForm(
  "tool_editor",
  toolEditorFormFieldsSchema.parse,
);

export const { useField: useToolEditorFormField } = toolEditorForm;

export default toolEditorForm;

//------------------------------------------------------------------------------
// Ability
//------------------------------------------------------------------------------

export const useToolEditorFormAbility = (
  defaultAbility: ToolEditorFormFields["ability"],
) => useToolEditorFormField("ability", defaultAbility);

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const useToolEditorFormCost = (
  defaultCost: ToolEditorFormFields["cost"],
) => useToolEditorFormField("cost", defaultCost);

//------------------------------------------------------------------------------
// Craft
//------------------------------------------------------------------------------

export const useToolEditorFormCraft = (
  defaultCraft: ToolEditorFormFields["craft"],
) => useToolEditorFormField("craft", defaultCraft);

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

export const useToolEditorFormMagic = (
  defaultMagic: ToolEditorFormFields["magic"],
) => useToolEditorFormField("magic", defaultMagic);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useToolEditorFormName = (
  defaultName: ToolEditorFormFields["name"],
) => useToolEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

export const useToolEditorFormNotes = (
  defaultNotes: ToolEditorFormFields["notes"],
) => useToolEditorFormField("notes", defaultNotes);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useToolEditorFormPage = (
  defaultPage: ToolEditorFormFields["page"],
) => useToolEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useToolEditorFormType = (
  defaultType: ToolEditorFormFields["type"],
) => useToolEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Utilize
//------------------------------------------------------------------------------

export const useToolEditorFormUtilize = (
  defaultUtilize: ToolEditorFormFields["utilize"],
) => useToolEditorFormField("utilize", defaultUtilize);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useToolEditorFormVisibility = (
  defaultVisibility: ToolEditorFormFields["visibility"],
) => useToolEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const useToolEditorFormWeight = (
  defaultWeight: ToolEditorFormFields["weight"],
) => useToolEditorFormField("weight", defaultWeight);
