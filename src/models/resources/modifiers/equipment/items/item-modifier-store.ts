import { createEquipmentModifierStore } from "../equipment-modifier-store";
import {
  defaultItemModifier,
  itemModifierSchema,
  itemModifierTranslationFields,
} from "./item-modifier";
import {
  defaultItemModifierFilters,
  itemModifierFiltersSchema,
  itemModifierOrderOptions,
} from "./item-modifier-filters";
import { useLocalizeItemModifier } from "./localized-item-modifier";

//------------------------------------------------------------------------------
// Item Modifier Store
//------------------------------------------------------------------------------

export const itemModifierStore = createEquipmentModifierStore(
  { p: "item_modifiers", s: "item_modifier" },
  {
    defaultFilters: defaultItemModifierFilters,
    defaultModifier: defaultItemModifier,
    filtersSchema: itemModifierFiltersSchema,
    kinds: ["item_modifier"],
    modifierSchema: itemModifierSchema,
    orderOptions: itemModifierOrderOptions,
    translationFields: itemModifierTranslationFields,
    useLocalizeModifier: useLocalizeItemModifier,
  },
);
