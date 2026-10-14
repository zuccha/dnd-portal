import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../equipment-modifier-detail-fields";

const useLocalizedResource = armorModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Armor Modifier Detail Route
//------------------------------------------------------------------------------

export default function ArmorModifierDetailRoute({ resourceId }: { resourceId: string }) {
  const resource = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
