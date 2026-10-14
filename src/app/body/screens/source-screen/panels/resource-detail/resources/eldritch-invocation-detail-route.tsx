import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = eldritchInvocationStore.useLocalizedResource;

//------------------------------------------------------------------------------
// EldritchInvocation Detail Route
//------------------------------------------------------------------------------

export default function EldritchInvocationDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
