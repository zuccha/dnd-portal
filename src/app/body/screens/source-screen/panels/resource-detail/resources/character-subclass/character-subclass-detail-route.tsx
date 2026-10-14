import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import ResourceDetailContent from "../../resource-detail-content";

const useLocalizedResource = characterSubclassStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Character Subclass Detail Route
//------------------------------------------------------------------------------

export default function CharacterSubclassDetailRoute({ resourceId }: { resourceId: string }) {
  const characterSubclass = useLocalizedResource(resourceId);
  return <ResourceDetailContent resource={characterSubclass} />;
}
