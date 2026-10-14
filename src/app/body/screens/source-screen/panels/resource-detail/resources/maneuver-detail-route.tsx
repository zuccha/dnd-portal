import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = maneuverStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Maneuver Detail Route
//------------------------------------------------------------------------------

export default function ManeuverDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
