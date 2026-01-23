import type { Item } from "~/models/resources/equipment/items/item";
import type { ItemFormData } from "~/models/resources/equipment/items/item-form";
import { useItemTypeOptions } from "~/models/types/item-type";
import type { Form } from "~/utils/form";
import { createSelectEnumField } from "../../resource-editor-form";
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
  // Type
  //----------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useItemTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Item Editor
  //----------------------------------------------------------------------------

  return function ItemEditor({ resource }: ItemEditorProps) {
    return (
      <EquipmentEditor resource={resource}>
        <TypeField defaultValue={resource.type} />
      </EquipmentEditor>
    );
  };
}
