import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = characterSubclassStore.useLocalizedResource;

//------------------------------------------------------------------------------
// CharacterSubclass Detail Route
//------------------------------------------------------------------------------

export default function CharacterSubclassDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
