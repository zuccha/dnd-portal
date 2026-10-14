import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = backgroundStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Background Detail Route
//------------------------------------------------------------------------------

export default function BackgroundDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
