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
import type { ResourceAction } from "../../resource-action";

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

const actions: ResourceAction<Tool>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ is_virtual }) => !is_virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: toolVariantDialog.open,
  },
];

const detailActions: ResourceAction<Tool>[] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ is_virtual }) => !is_virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: (resource) => toolVariantDialog.open(resource, { navigateAfterCreation: true }),
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
    detail: { Detail: ToolDetail, actions: detailActions },
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
