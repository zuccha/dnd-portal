import { LayersIcon, WandIcon } from "lucide-react";
import { type LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import { type Tool } from "~/models/resources/equipment/tools/tool";
import {
  toolForm,
  toolFormDataToDB,
} from "~/models/resources/equipment/tools/tool-form";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { ToolCard } from "./tool-card";
import { createToolEditor } from "./tool-editor";
import ToolsFilters from "./tools-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Tool, LocalizedTool>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "ability",
    label: { en: "Ability", it: "Abilità" },
  },
  {
    icon: WandIcon,
    key: "magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
    w: "1%",
  },
  {
    key: "weight",
    label: { en: "Weight", it: "Peso" },
    textAlign: "right",
    w: "1%",
    whiteSpace: "nowrap",
  },
  {
    key: "cost",
    label: { en: "Cost", it: "Costo" },
    textAlign: "right",
    w: "1%",
    whiteSpace: "nowrap",
  },
] as const;

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Tool, LocalizedTool>["actions"] = [
  {
    icon: LayersIcon,
    isVisible: (tool) => tool.modifier_ids.length > 0,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: (tool) => console.log("Add variant", tool),
  },
];

//------------------------------------------------------------------------------
// Tools Panel
//------------------------------------------------------------------------------

const ToolsPanel = createResourcesPanel(
  toolStore,
  { initialPaletteName: "coral" },
  {
    album: { AlbumCard: ToolCard, actions },
    filters: { Filters: ToolsFilters },
    form: {
      Editor: createToolEditor(toolForm),
      form: toolForm,
      parseFormData: toolFormDataToDB,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);

export default ToolsPanel;
