import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../equipment-modifier-detail-fields";

const useLocalizedResource = toolModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Tool Modifier Detail Route
//------------------------------------------------------------------------------

export default function ToolModifierDetailRoute({ resourceId }: { resourceId: string }) {
  const resource = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
