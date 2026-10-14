import { featureStore } from "~/models/resources/features/feature-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = featureStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Feature Detail Route
//------------------------------------------------------------------------------

export default function FeatureDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
