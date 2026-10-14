import { featStore } from "~/models/resources/feats/feat-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = featStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Feat Detail Route
//------------------------------------------------------------------------------

export default function FeatDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
