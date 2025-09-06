import { createForm } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type WeaponEditorFormFields = {
  name: string;
};

export const weaponEditorForm = createForm<
  WeaponEditorFormFields,
  { id: string; lang: string }
>(async (data) => {
  console.log(data);
  return undefined;
});

export const { useField } = weaponEditorForm;

export default weaponEditorForm;
