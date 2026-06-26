import type { WeaponModifierFormData } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-form";
import type { ResourceOption } from "~/models/resources/resource";
import type { Form } from "~/utils/form";
import { createEquipmentModifierEditor } from "../equipment-modifier-editor";

//------------------------------------------------------------------------------
// Create Weapon Modifier Editor
//------------------------------------------------------------------------------

type SupportedWeaponOptionsStore = {
  useResourceOptions: (sourceId: string) => ResourceOption[];
};

export function createWeaponModifierEditor(
  form: Form<WeaponModifierFormData>,
  supportedWeaponStore: SupportedWeaponOptionsStore,
) {
  return createEquipmentModifierEditor(form, supportedWeaponStore);
}
