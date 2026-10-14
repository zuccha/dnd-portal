import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../equipment-modifier-detail-fields";

const useLocalizedResource = itemModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Item Modifier Detail Route
//------------------------------------------------------------------------------

export default function ItemModifierDetailRoute({ resourceId }: { resourceId: string }) {
  const resource = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
