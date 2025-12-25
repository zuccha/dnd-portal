import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Item Editor Form Fields
//------------------------------------------------------------------------------

export const itemEditorFormFieldsSchema = z.object({
  cost: z.number(),
  magic: z.boolean(),
  name: z.string(),
  notes: z.string(),
  page: z.number(),
  visibility: campaignRoleSchema,
  weight: z.number(),
});

export type ItemEditorFormFields = z.infer<typeof itemEditorFormFieldsSchema>;

//------------------------------------------------------------------------------
// Item Editor Form
//------------------------------------------------------------------------------

export const itemEditorForm = createForm(
  "item_editor",
  itemEditorFormFieldsSchema.parse,
);

export const { useField: useItemEditorFormField } = itemEditorForm;

export default itemEditorForm;

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const useItemEditorFormCost = (
  defaultCost: ItemEditorFormFields["cost"],
) => useItemEditorFormField("cost", defaultCost);

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

export const useItemEditorFormMagic = (
  defaultMagic: ItemEditorFormFields["magic"],
) => useItemEditorFormField("magic", defaultMagic);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useItemEditorFormName = (
  defaultName: ItemEditorFormFields["name"],
) => useItemEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

export const useItemEditorFormNotes = (
  defaultNotes: ItemEditorFormFields["notes"],
) => useItemEditorFormField("notes", defaultNotes);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useItemEditorFormPage = (
  defaultPage: ItemEditorFormFields["page"],
) => useItemEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useItemEditorFormVisibility = (
  defaultVisibility: ItemEditorFormFields["visibility"],
) => useItemEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const useItemEditorFormWeight = (
  defaultWeight: ItemEditorFormFields["weight"],
) => useItemEditorFormField("weight", defaultWeight);
