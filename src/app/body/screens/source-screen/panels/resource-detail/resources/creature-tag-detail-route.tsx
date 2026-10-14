import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = creatureTagStore.useLocalizedResource;

//------------------------------------------------------------------------------
// CreatureTag Detail Route
//------------------------------------------------------------------------------

export default function CreatureTagDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
