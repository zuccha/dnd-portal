import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import ResourceDetailContent from "../../resource-detail-content";

const useLocalizedResource = armorStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Armor Detail Route
//------------------------------------------------------------------------------

export default function ArmorDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
