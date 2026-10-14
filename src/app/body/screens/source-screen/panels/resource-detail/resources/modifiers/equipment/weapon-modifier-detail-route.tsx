import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import ResourceDetailContent from "../../../resource-detail-content";

const useLocalizedResource = weaponModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// WeaponModifier Detail Route
//------------------------------------------------------------------------------

export default function WeaponModifierDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
