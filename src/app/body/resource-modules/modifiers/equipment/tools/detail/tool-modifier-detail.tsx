import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import ResourceDetailContent from "../../../../resource-detail-content";
import EquipmentModifierDetailFields from "../../equipment-modifier-detail-fields";

type ToolModifierDetailResource = ReturnType<typeof toolModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Tool Modifier Detail
//------------------------------------------------------------------------------

export default function ToolModifierDetail({ resource }: { resource: ToolModifierDetailResource }) {
  return (
    <ResourceDetailContent
      detailsContent={resource && <EquipmentModifierDetailFields resource={resource} />}
      resource={resource}
    />
  );
}
