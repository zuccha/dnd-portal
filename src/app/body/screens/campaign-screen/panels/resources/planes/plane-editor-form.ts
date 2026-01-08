import { z } from "zod";
import { campaignRoleSchema } from "~/models/types/campaign-role";
import { creatureAlignmentSchema } from "~/models/types/creature-alignment";
import { planeCategorySchema } from "~/models/types/plane-category";
import { createForm } from "~/utils/form";

//------------------------------------------------------------------------------
// Plane Editor Form Fields
//------------------------------------------------------------------------------

export const planeEditorFormFieldsSchema = z.object({
  alignments: z.array(creatureAlignmentSchema),
  category: planeCategorySchema,
  name: z.string(),
  page: z.number(),
  visibility: campaignRoleSchema,
});

export type PlaneEditorFormFields = z.infer<typeof planeEditorFormFieldsSchema>;

//------------------------------------------------------------------------------
// Plane Editor Form
//------------------------------------------------------------------------------

export const planeEditorForm = createForm(
  "plane_editor",
  planeEditorFormFieldsSchema.parse,
);

export const { useField: usePlaneEditorFormField } = planeEditorForm;

export default planeEditorForm;

//------------------------------------------------------------------------------
// Alignments
//------------------------------------------------------------------------------

export const usePlaneEditorFormAlignments = (
  defaultAlignments: PlaneEditorFormFields["alignments"],
) => usePlaneEditorFormField("alignments", defaultAlignments);

//------------------------------------------------------------------------------
// Category
//------------------------------------------------------------------------------

export const usePlaneEditorFormCategory = (
  defaultCategory: PlaneEditorFormFields["category"],
) => usePlaneEditorFormField("category", defaultCategory);

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const usePlaneEditorFormName = (defaultName: string) =>
  usePlaneEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const usePlaneEditorFormPage = (
  defaultPage: PlaneEditorFormFields["page"],
) => usePlaneEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const usePlaneEditorFormVisibility = (
  defaultVisibility: PlaneEditorFormFields["visibility"],
) => usePlaneEditorFormField("visibility", defaultVisibility);
