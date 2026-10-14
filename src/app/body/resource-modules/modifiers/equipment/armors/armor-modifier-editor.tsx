import type { ArmorModifierFormData } from "~/models/resources/modifiers/equipment/armors/armor-modifier-form";
import type { ResourceOption } from "~/models/resources/resource";
import type { Form } from "~/utils/form";
import { createEquipmentModifierEditor } from "../equipment-modifier-editor";

//------------------------------------------------------------------------------
// Create Armor Modifier Editor
//------------------------------------------------------------------------------

type SupportedArmorOptionsStore = {
  useResourceOptions: (sourceId: string) => ResourceOption[];
};

export function createArmorModifierEditor(
  form: Form<ArmorModifierFormData>,
  supportedArmorStore: SupportedArmorOptionsStore,
) {
  return createEquipmentModifierEditor(form, supportedArmorStore);
}
