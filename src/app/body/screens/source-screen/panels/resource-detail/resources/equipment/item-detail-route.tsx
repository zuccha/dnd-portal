import { itemStore } from "~/models/resources/equipment/items/item-store";
import ResourceDetailContent from "../../resource-detail-content";

const useLocalizedResource = itemStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Item Detail Route
//------------------------------------------------------------------------------

export default function ItemDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
