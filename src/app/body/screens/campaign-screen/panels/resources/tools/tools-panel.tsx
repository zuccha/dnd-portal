import { WandIcon } from "lucide-react";
import {
  type DBTool,
  type DBToolTranslation,
  dbToolSchema,
  dbToolTranslationSchema,
} from "~/models/resources/equipment/tools/db-tool";
import { type LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import {
  type Tool,
  defaultTool,
} from "~/models/resources/equipment/tools/tool";
import { toolsStore } from "~/models/resources/equipment/tools/tools-store";
import { report } from "~/utils/error";
import type { ResourcesListTableColumn } from "../_base/resources-list-table";
import { createResourcesPanel } from "../_base/resources-panel";
import ToolCard from "./tool-card";
import ToolEditor from "./tool-editor";
import toolEditorForm, { type ToolEditorFormFields } from "./tool-editor-form";
import ToolsFilters from "./tools-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Tool, LocalizedTool>[] = [
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

const ToolsPanel = createResourcesPanel({
  Card: ToolCard,
  EditorContent: ToolEditor,
  Filters: ToolsFilters,
  defaultResource: defaultTool,
  form: toolEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "notes",
  name: { en: "tools", it: "armi" },
  parseFormData,
  store: toolsStore,
});

export default ToolsPanel;
