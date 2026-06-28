import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { useLocalizeToolModifier } from "./localized-tool-modifier";
import {
  defaultToolModifier,
  toolModifierSchema,
  toolModifierTranslationFields,
} from "./tool-modifier";
import {
  defaultToolModifierFilters,
  toolModifierFiltersSchema,
  toolModifierOrderOptions,
} from "./tool-modifier-filters";

//------------------------------------------------------------------------------
// Tool Modifier Store
//------------------------------------------------------------------------------

export const toolModifierStore = createEquipmentModifierStore(
  { p: "tool_modifiers", s: "tool_modifier" },
  {
    defaultFilters: defaultToolModifierFilters,
    defaultModifier: defaultToolModifier,
    displayName: { en: "Tool Variants", it: "Varianti degli Strumenti" },
    filtersSchema: toolModifierFiltersSchema,
    kinds: ["tool_modifier"],
    modifierSchema: toolModifierSchema,
    orderOptions: toolModifierOrderOptions,
    translationFields: toolModifierTranslationFields,
    useLocalizeModifier: useLocalizeToolModifier,
  },
);
