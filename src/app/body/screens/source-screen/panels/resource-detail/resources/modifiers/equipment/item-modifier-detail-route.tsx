import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import ResourceDetailContent from "../../../resource-detail-content";

const useLocalizedResource = itemModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// ItemModifier Detail Route
//------------------------------------------------------------------------------

export default function ItemModifierDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
