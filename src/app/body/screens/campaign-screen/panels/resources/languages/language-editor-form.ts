import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { languageRaritySchema } from "~/models/types/language-rarity";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Language Editor Form Fields
//------------------------------------------------------------------------------

export const languageEditorFormFieldsSchema = z.object({
  name: z.string(),
  origin: z.string(),
  page: z.number(),
  rarity: languageRaritySchema,
  visibility: campaignRoleSchema,
});

export type LanguageEditorFormFields = z.infer<
  typeof languageEditorFormFieldsSchema
>;

//------------------------------------------------------------------------------
// Language Editor Form
//------------------------------------------------------------------------------

export const languageEditorForm = createForm(
  "language_editor",
  languageEditorFormFieldsSchema.parse,
);

export const { useField: useLanguageEditorFormField } = languageEditorForm;

export default languageEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useLanguageEditorFormName = (defaultName: string) =>
  useLanguageEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Origin
//------------------------------------------------------------------------------

export const useLanguageEditorFormOrigin = (
  defaultOrigin: LanguageEditorFormFields["origin"],
) => useLanguageEditorFormField("origin", defaultOrigin);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useLanguageEditorFormPage = (
  defaultPage: LanguageEditorFormFields["page"],
) => useLanguageEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Rarity
//------------------------------------------------------------------------------

export const useLanguageEditorFormRarity = (
  defaultRarity: LanguageEditorFormFields["rarity"],
) => useLanguageEditorFormField("rarity", defaultRarity);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useLanguageEditorFormVisibility = (
  defaultVisibility: LanguageEditorFormFields["visibility"],
) => useLanguageEditorFormField("visibility", defaultVisibility);
