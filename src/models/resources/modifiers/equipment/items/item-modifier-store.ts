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

export const itemModifierStore = createEquipmentModifierStore("item_modifier", {
  defaultFilters: defaultItemModifierFilters,
  defaultModifier: defaultItemModifier,
  displayName: {
    en: "Adventuring Gear Variants",
    it: "Varianti dell'Attrezzatura",
  },
  filtersSchema: itemModifierFiltersSchema,
  modifierSchema: itemModifierSchema,
  orderOptions: itemModifierOrderOptions,
  translationFields: itemModifierTranslationFields,
  useLocalizeModifier: useLocalizeItemModifier,
});
