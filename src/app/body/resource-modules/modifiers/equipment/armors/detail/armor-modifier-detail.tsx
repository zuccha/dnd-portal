import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import EquipmentModifierDetail from "../../equipment-modifier-detail";
import type { ResourceDetailAction } from "../../../../resource-detail";

type ArmorModifierDetailResource = ReturnType<typeof armorModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Armor Modifier Detail
//------------------------------------------------------------------------------

export default function ArmorModifierDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ArmorModifierDetailResource;
}) {
  return <EquipmentModifierDetail actions={actions} resource={resource} />;
}
