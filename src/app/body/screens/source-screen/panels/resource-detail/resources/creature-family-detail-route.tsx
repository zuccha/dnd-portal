import { creatureFamilyStore } from "~/models/resources/creature-families/creature-family-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = creatureFamilyStore.useLocalizedResource;

//------------------------------------------------------------------------------
// CreatureFamily Detail Route
//------------------------------------------------------------------------------

export default function CreatureFamilyDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
