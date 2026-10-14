import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../../equipment-modifier-detail-fields";

type ArmorModifierDetailResource = ReturnType<typeof armorModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Armor Modifier Detail
//------------------------------------------------------------------------------

export default function ArmorModifierDetail({
  resource,
}: {
  resource: ArmorModifierDetailResource;
}) {
  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
