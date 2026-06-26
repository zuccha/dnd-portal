import type { ToolModifierFormData } from "~/models/resources/modifiers/equipment/tools/tool-modifier-form";
import type { ResourceOption } from "~/models/resources/resource";
import type { Form } from "~/utils/form";
import { createEquipmentModifierEditor } from "../equipment-modifier-editor";

//------------------------------------------------------------------------------
// Create Tool Modifier Editor
//------------------------------------------------------------------------------

type SupportedToolOptionsStore = {
  useResourceOptions: (sourceId: string) => ResourceOption[];
};

export function createToolModifierEditor(
  form: Form<ToolModifierFormData>,
  supportedToolStore: SupportedToolOptionsStore,
) {
  return createEquipmentModifierEditor(form, supportedToolStore);
}
