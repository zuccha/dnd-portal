import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { localizeEquipmentModifier } from "../localized-equipment-modifier";
import { defaultItemModifier, itemModifierTranslationFields } from "./item-modifier";
import {
  defaultItemModifierFilters,
  itemModifierFiltersSchema,
  itemModifierOrderOptions,
} from "./item-modifier-filters";

//------------------------------------------------------------------------------
// Item Modifier Store
//------------------------------------------------------------------------------

export const itemModifierStore = createEquipmentModifierStore("item_modifier", {
  defaultFilters: defaultItemModifierFilters,
  defaultModifier: defaultItemModifier,
  displayName: {
    en: "Item Variants",
    it: "Varianti degli oggetti",
  },
  filtersSchema: itemModifierFiltersSchema,
  orderOptions: itemModifierOrderOptions,
  translationFields: itemModifierTranslationFields,
  localizeModifier: localizeEquipmentModifier,
});
