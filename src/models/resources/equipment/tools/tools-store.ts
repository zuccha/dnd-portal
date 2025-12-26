import { createEquipmentsStore } from "../equipments-store";
import { useLocalizeTool } from "./localized-tool";
import { defaultToolFilters, toolFiltersSchema, toolSchema } from "./tool";

//------------------------------------------------------------------------------
// Tools Store
//------------------------------------------------------------------------------

export const toolsStore = createEquipmentsStore(
  { p: "tools", s: "tool" },
  toolSchema,
  toolFiltersSchema,
  defaultToolFilters,
  useLocalizeTool,
);

export const {
  useFromCampaign: useToolsFromCampaign,
  useFilters: useToolFilters,
  useNameFilter: useToolNameFilter,
  useIsSelected: useIsToolSelected,
  useSelectionCount: useToolsSelectionCount,
  create: createTool,
  update: updateTool,
} = toolsStore;
