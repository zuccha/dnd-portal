import { WandIcon } from "lucide-react";
import {
  type DBTool,
  type DBToolTranslation,
  dbToolSchema,
  dbToolTranslationSchema,
} from "~/models/resources/equipment/tools/db-tool";
import { type LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import { type Tool } from "~/models/resources/equipment/tools/tool";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import ToolEditor from "./tool-editor";
import toolEditorForm, { type ToolEditorFormFields } from "./tool-editor-form";
import ToolsAlbumCardContent from "./tools-album-card-content";
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
    w: "4em",
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<ToolEditorFormFields>,
):
  | { resource: Partial<DBTool>; translation: Partial<DBToolTranslation> }
  | string {
  const maybeTool = {
    ability: data.ability,
    cost: data.cost,
    magic: data.magic,
    type: data.type,
    visibility: data.visibility,
    weight: data.weight,
  };

  const maybeTranslation = {
    craft: data.craft,
    name: data.name,
    notes: data.notes,
    page: data.page || null,
    utilize: data.utilize,
  };

  const tool = dbToolSchema.partial().safeParse(maybeTool);
  if (!tool.success) return report(tool.error, "form.error.invalid");

  const translation = dbToolTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: tool.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Tools Panel
//------------------------------------------------------------------------------

const ToolsPanel = createResourcesPanel(toolStore, {
  album: {
    AlbumCardContent: ToolsAlbumCardContent,
    getDetails: (localizedTool) => localizedTool.notes,
  },
  filters: { Filters: ToolsFilters },
  form: { Editor: ToolEditor, form: toolEditorForm, parseFormData },
  table: { columns, detailsKey: "notes" },
});

export default ToolsPanel;
