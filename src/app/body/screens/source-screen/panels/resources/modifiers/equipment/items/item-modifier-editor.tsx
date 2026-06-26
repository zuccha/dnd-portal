import type { ItemModifierFormData } from "~/models/resources/modifiers/equipment/items/item-modifier-form";
import type { ResourceOption } from "~/models/resources/resource";
import type { Form } from "~/utils/form";
import { createEquipmentModifierEditor } from "../equipment-modifier-editor";

//------------------------------------------------------------------------------
// Create Item Modifier Editor
//------------------------------------------------------------------------------

type SupportedItemOptionsStore = {
  useResourceOptions: (sourceId: string) => ResourceOption[];
};

export function createItemModifierEditor(
  form: Form<ItemModifierFormData>,
  supportedItemStore: SupportedItemOptionsStore,
) {
  return createEquipmentModifierEditor(form, supportedItemStore);
}
