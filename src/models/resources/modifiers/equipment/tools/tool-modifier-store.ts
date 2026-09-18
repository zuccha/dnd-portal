import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { localizeEquipmentModifier } from "../localized-equipment-modifier";
import { defaultToolModifier, toolModifierTranslationFields } from "./tool-modifier";
import {
  defaultToolModifierFilters,
  toolModifierFiltersSchema,
  toolModifierOrderOptions,
} from "./tool-modifier-filters";

//------------------------------------------------------------------------------
// Tool Modifier Store
//------------------------------------------------------------------------------

export const toolModifierStore = createEquipmentModifierStore("tool_modifier", {
  defaultFilters: defaultToolModifierFilters,
  defaultModifier: defaultToolModifier,
  displayName: { en: "Tool Variants", it: "Varianti degli Strumenti" },
  filtersSchema: toolModifierFiltersSchema,
  orderOptions: toolModifierOrderOptions,
  translationFields: toolModifierTranslationFields,
  localizeModifier: localizeEquipmentModifier,
});
