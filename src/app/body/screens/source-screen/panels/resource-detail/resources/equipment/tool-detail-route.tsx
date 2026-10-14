import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import ResourceDetailContent from "../../resource-detail-content";

const useLocalizedResource = toolStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Tool Detail Route
//------------------------------------------------------------------------------

export default function ToolDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
