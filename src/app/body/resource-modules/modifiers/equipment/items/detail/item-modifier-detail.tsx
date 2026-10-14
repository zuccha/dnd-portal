import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../../equipment-modifier-detail-fields";

type ItemModifierDetailResource = ReturnType<typeof itemModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Item Modifier Detail
//------------------------------------------------------------------------------

export default function ItemModifierDetail({ resource }: { resource: ItemModifierDetailResource }) {
  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
