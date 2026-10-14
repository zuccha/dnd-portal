import { creatureStore } from "~/models/resources/creatures/creature-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = creatureStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Creature Detail Route
//------------------------------------------------------------------------------

export default function CreatureDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
