import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../../equipment-modifier-detail-fields";

type WeaponModifierDetailResource = ReturnType<typeof weaponModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Weapon Modifier Detail
//------------------------------------------------------------------------------

export default function WeaponModifierDetail({
  resource,
}: {
  resource: WeaponModifierDetailResource;
}) {
  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
