import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = characterClassStore.useLocalizedResource;

//------------------------------------------------------------------------------
// CharacterClass Detail Route
//------------------------------------------------------------------------------

export default function CharacterClassDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
