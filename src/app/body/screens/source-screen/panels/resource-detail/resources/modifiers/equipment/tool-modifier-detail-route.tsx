import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import ResourceDetailContent from "../../../resource-detail-content";

const useLocalizedResource = toolModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// ToolModifier Detail Route
//------------------------------------------------------------------------------

export default function ToolModifierDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
