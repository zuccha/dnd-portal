import { matchesInclusion } from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
import { useLocalizeTool } from "./localized-tool";
import { defaultTool, toolSchema, toolTranslationFields } from "./tool";
import {
  defaultToolFilters,
  toolFiltersSchema,
  toolOrderOptions,
} from "./tool-filters";

//------------------------------------------------------------------------------
// Tool Store
//------------------------------------------------------------------------------

export const toolStore = createEquipmentStore("tool", {
  defaultEquipment: defaultTool,
  defaultFilters: defaultToolFilters,
  displayName: { en: "Tools", it: "Strumenti" },
  equipmentSchema: toolSchema,
  filtersSchema: toolFiltersSchema,
  matchesEquipment: (tool, filters) =>
    matchesEquipment(tool, filters) &&
    matchesInclusion(tool.ability, filters.abilities) &&
    matchesInclusion(tool.type, filters.types),
  orderOptions: toolOrderOptions,
  translationFields: toolTranslationFields,
  useLocalizeEquipment: useLocalizeTool,
});
