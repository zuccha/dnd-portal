import EquipmentModifierDetailFields from "~/app/body/screens/source-screen/panels/resources/modifiers/equipment/detail/equipment-modifier-detail-fields";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import ResourceDetailContent from "../../../../detail/resource-detail-content";

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
