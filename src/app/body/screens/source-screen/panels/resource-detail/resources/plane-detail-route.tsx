import { planeStore } from "~/models/resources/planes/plane-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = planeStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Plane Detail Route
//------------------------------------------------------------------------------

export default function PlaneDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
