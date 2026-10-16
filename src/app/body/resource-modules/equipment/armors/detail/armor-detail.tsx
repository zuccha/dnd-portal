import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";
import type { ResourceDetailAction } from "../../../resource-detail";

type ArmorDetailResource = ReturnType<typeof armorStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Armor Detail
//------------------------------------------------------------------------------

export default function ArmorDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ArmorDetailResource;
}) {
  const armor = resource;

  return (
    <EquipmentDetail actions={actions} resource={armor}>
      {armor && (
        <>
          <ResourceDetailField label={armor.armor_class.label}>
            {armor.armor_class.value}
          </ResourceDetailField>
          {armor.requirements.value && (
            <ResourceDetailField label={armor.requirements.label}>
              {armor.requirements.value}
            </ResourceDetailField>
          )}
          {armor.stealth.value && (
            <ResourceDetailField label={armor.stealth.label}>
              {armor.stealth.value}
            </ResourceDetailField>
          )}
        </>
      )}
    </EquipmentDetail>
  );
}
