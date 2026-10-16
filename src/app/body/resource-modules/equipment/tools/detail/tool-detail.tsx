import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";
import type { ResourceDetailAction } from "../../../resource-detail";

type ToolDetailResource = LocalizedTool | undefined;

//------------------------------------------------------------------------------
// Tool Detail
//------------------------------------------------------------------------------

export default function ToolDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ToolDetailResource;
}) {
  const tool = resource;

  return (
    <EquipmentDetail actions={actions} resource={tool}>
      {tool && (
        <ResourceDetailField label={tool.ability.label}>{tool.ability.value}</ResourceDetailField>
      )}
    </EquipmentDetail>
  );
}
