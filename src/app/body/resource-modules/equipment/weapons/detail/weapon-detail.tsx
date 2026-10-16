import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import ResourceDetailField from "../../../resource-detail-field";
import ResourceDetailLinks from "../../../resource-detail-links";
import EquipmentDetail from "../../equipment-detail";
import type { ResourceDetailAction } from "../../../resource-detail";

type WeaponDetailResource = ReturnType<typeof weaponStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Weapon Detail
//------------------------------------------------------------------------------

export default function WeaponDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: WeaponDetailResource;
}) {
  const weapon = resource;

  return (
    <EquipmentDetail actions={actions} resource={weapon}>
      {weapon && (
        <>
          <ResourceDetailField label={weapon.damage.label}>
            {weapon.damage.value}
          </ResourceDetailField>
          {weapon.damageVersatile.value && (
            <ResourceDetailField label={weapon.damageVersatile.label}>
              {weapon.damageVersatile.value}
            </ResourceDetailField>
          )}
          {weapon.isRanged && weapon.range.value && (
            <ResourceDetailField label={weapon.range.label}>
              {weapon.range.value}
            </ResourceDetailField>
          )}
          {weapon.properties.value && (
            <ResourceDetailField label={weapon.properties.label}>
              {weapon.properties.value}
            </ResourceDetailField>
          )}
          {weapon.ammunition.resources.length > 0 && (
            <ResourceDetailField label={weapon.ammunition.label}>
              <ResourceDetailLinks resources={weapon.ammunition.resources} />
            </ResourceDetailField>
          )}
        </>
      )}
    </EquipmentDetail>
  );
}
