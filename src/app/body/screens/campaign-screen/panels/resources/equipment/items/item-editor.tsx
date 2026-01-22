import type { Item } from "~/models/resources/equipment/items/item";
import type { ItemFormData } from "~/models/resources/equipment/items/item-form";
import type { Form } from "~/utils/form";
import { createEquipmentEditor } from "../equipment-editor";

//------------------------------------------------------------------------------
// Item Editor
//------------------------------------------------------------------------------

export type ItemEditorProps = {
  resource: Item;
};

export function createItemEditor(form: Form<ItemFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form);

  //----------------------------------------------------------------------------
  // Item Editor
  //----------------------------------------------------------------------------

  return function ItemEditor({ resource }: ItemEditorProps) {
    return <EquipmentEditor resource={resource} />;
  };
}
