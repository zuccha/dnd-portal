import { matchesInclusion } from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
import { localizeTool, useToolLocalizationContext } from "./localized-tool";
import { defaultTool, toolTranslationFields } from "./tool";
import { defaultToolFilters, toolFiltersSchema, toolOrderOptions } from "./tool-filters";

//------------------------------------------------------------------------------
// Tool Store
//------------------------------------------------------------------------------

export const toolStore = createEquipmentStore("tool", {
  defaultEquipment: defaultTool,
  defaultFilters: defaultToolFilters,
  displayName: { en: "Tools", it: "Strumenti" },
  filtersSchema: toolFiltersSchema,
  matchesEquipment: (tool, filters) =>
    matchesEquipment(tool, filters) &&
    matchesInclusion(tool.ability, filters.abilities) &&
    matchesInclusion(tool.type, filters.types),
  orderOptions: toolOrderOptions,
  translationFields: toolTranslationFields,
  localizeEquipment: localizeTool,
  useEquipmentLocalizationContext: useToolLocalizationContext,
});
