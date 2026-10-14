import { speciesStore } from "~/models/resources/species/species-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = speciesStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Species Detail Route
//------------------------------------------------------------------------------

export default function SpeciesDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
