import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import EquipmentModifierDetail from "../../equipment-modifier-detail";
import type { ResourceDetailAction } from "../../../../resource-detail";

type WeaponModifierDetailResource = ReturnType<typeof weaponModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Weapon Modifier Detail
//------------------------------------------------------------------------------

export default function WeaponModifierDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: WeaponModifierDetailResource;
}) {
  return <EquipmentModifierDetail actions={actions} resource={resource} />;
}
