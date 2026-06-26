import { HStack, VStack } from "@chakra-ui/react";
import type { Item } from "~/models/resources/equipment/items/item";
import type { ItemFormData } from "~/models/resources/equipment/items/item-form";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import { useItemTypeOptions } from "~/models/types/item-type";
import type { Form } from "~/utils/form";
import {
  createNumberInputField,
  createSelectEnumField,
  createSwitchField,
} from "../../resource-editor-form";
import { createEquipmentEditor } from "../equipment-editor";

//------------------------------------------------------------------------------
// Item Editor
//------------------------------------------------------------------------------

export type ItemEditorProps = {
  resource: Item;
  sourceId: string;
};

export function createItemEditor(form: Form<ItemFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form, itemModifierStore);

  //----------------------------------------------------------------------------
  // Charges
  //----------------------------------------------------------------------------

  const ChargesField = createNumberInputField({
    i18nContext: { label: { en: "Charges (0 = ∞)", it: "Cariche (0 = ∞)" } },
    inputProps: { min: 0 },
    useField: form.createUseField("charges"),
  });

  //----------------------------------------------------------------------------
  // Consumable
  //----------------------------------------------------------------------------

  const ConsumableField = createSwitchField({
    i18nContext: { label: { en: "Consumable", it: "Consumabile" } },
    useField: form.createUseField("consumable"),
  });

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

  return function ItemEditor({ resource, sourceId }: ItemEditorProps) {
    return (
      <EquipmentEditor resource={resource} sourceId={sourceId}>
        <HStack align="flex-start" gap={4} w="full">
          <TypeField defaultValue={resource.type} />
          <VStack align="flex-start" gap={2} w="full">
            <ChargesField defaultValue={resource.charges ?? 0} />
            <ConsumableField defaultValue={resource.consumable} flex={1} />
          </VStack>
        </HStack>
      </EquipmentEditor>
    );
  };
}
