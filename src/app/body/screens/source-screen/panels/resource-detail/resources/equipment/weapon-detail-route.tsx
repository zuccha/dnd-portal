import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import ResourceDetailContent from "../../resource-detail-content";

const useLocalizedResource = weaponStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Weapon Detail Route
//------------------------------------------------------------------------------

export default function WeaponDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
