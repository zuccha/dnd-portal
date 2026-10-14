import { spellStore } from "~/models/resources/spells/spell-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = spellStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Spell Detail Route
//------------------------------------------------------------------------------

export default function SpellDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
