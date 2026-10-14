import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import EquipmentModifierDetail from "../../equipment-modifier-detail";
import type { ResourceDetailAction } from "../../../../resource-detail";

type ItemModifierDetailResource = ReturnType<typeof itemModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Item Modifier Detail
//------------------------------------------------------------------------------

export default function ItemModifierDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ItemModifierDetailResource;
}) {
  return <EquipmentModifierDetail actions={actions} resource={resource} />;
}
