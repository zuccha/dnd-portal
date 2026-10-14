import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../equipment-modifier-detail-fields";

const useLocalizedResource = weaponModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Weapon Modifier Detail Route
//------------------------------------------------------------------------------

export default function WeaponModifierDetailRoute({ resourceId }: { resourceId: string }) {
  const resource = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
