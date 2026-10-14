import EquipmentModifierDetailFields from "~/app/body/screens/source-screen/panels/resources/modifiers/equipment/detail/equipment-modifier-detail-fields";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import ResourceDetailContent from "../../../../detail/resource-detail-content";

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
