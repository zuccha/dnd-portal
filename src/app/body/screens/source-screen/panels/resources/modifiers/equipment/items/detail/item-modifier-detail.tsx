import EquipmentModifierDetailFields from "~/app/body/screens/source-screen/panels/resources/modifiers/equipment/detail/equipment-modifier-detail-fields";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import ResourceDetailContent from "../../../../detail/resource-detail-content";

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
