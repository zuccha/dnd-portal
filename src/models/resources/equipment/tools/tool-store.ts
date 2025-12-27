import { createEquipmentStore } from "../equipment-store";
import { useLocalizeTool } from "./localized-tool";
import {
  defaultTool,
  defaultToolFilters,
  toolFiltersSchema,
  toolSchema,
} from "./tool";

//------------------------------------------------------------------------------
// Tool Store
//------------------------------------------------------------------------------

export const toolStore = createEquipmentStore(
  { p: "tools", s: "tool" },
  {
    defaultEquipment: defaultTool,
    defaultFilters: defaultToolFilters,
    equipmentSchema: toolSchema,
    filtersSchema: toolFiltersSchema,
    useLocalizeEquipment: useLocalizeTool,
  },
);
