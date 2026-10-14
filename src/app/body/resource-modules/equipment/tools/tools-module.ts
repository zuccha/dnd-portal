import { LayersIcon } from "lucide-react";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { type LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import { type Tool } from "~/models/resources/equipment/tools/tool";
import { toolForm, toolFormDataToResource } from "~/models/resources/equipment/tools/tool-form";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../../resource-module";
import { createEquipmentTableColumns } from "../equipment-table-columns";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import ToolDetail from "./detail/tool-detail";
import { ToolCard } from "./panel/tool-card";
import ToolsFilters from "./panel/tools-filters";
import { createToolEditor } from "./tool-editor";
import type { ResourcesTableExtra } from "../../resources-table";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createEquipmentTableColumns<Tool, LocalizedTool>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "ability",
    label: { en: "Ability", it: "Abilità" },
  },
]);

//------------------------------------------------------------------------------
// Tool Variant Dialog
//------------------------------------------------------------------------------

const toolVariantDialog = createEquipmentVariantDialog(toolStore, toolModifierStore);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Tool, LocalizedTool>["actions"] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ virtual }) => !virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: toolVariantDialog.open,
  },
];

//------------------------------------------------------------------------------
// Tools Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  toolStore,
  { initialPaletteName: "coral", path: Route.ResourcesEquipmentTools },
  {
    Extra: toolVariantDialog.Dialog,
    album: { AlbumCard: ToolCard, actions },
    detail: { Detail: ToolDetail, actions },
    filters: { Filters: ToolsFilters },
    form: {
      Editor: createToolEditor(toolForm),
      form: toolForm,
      parseFormData: toolFormDataToResource,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);
