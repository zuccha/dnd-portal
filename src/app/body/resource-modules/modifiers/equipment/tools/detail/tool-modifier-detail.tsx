import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import EquipmentModifierDetail from "../../equipment-modifier-detail";
import type { ResourceDetailAction } from "../../../../resource-detail";

type ToolModifierDetailResource = ReturnType<typeof toolModifierStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Tool Modifier Detail
//------------------------------------------------------------------------------

export default function ToolModifierDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ToolModifierDetailResource;
}) {
  return <EquipmentModifierDetail actions={actions} resource={resource} />;
}
