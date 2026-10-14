import EquipmentModifierDetailFields from "~/app/body/screens/source-screen/panels/resources/modifiers/equipment/detail/equipment-modifier-detail-fields";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import ResourceDetailContent from "../../../../detail/resource-detail-content";

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
