import { serviceStore } from "~/models/resources/services/service-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = serviceStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Service Detail Route
//------------------------------------------------------------------------------

export default function ServiceDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
