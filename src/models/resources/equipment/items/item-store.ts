import { matchesBoolean, matchesInclusion } from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
import { defaultItem, itemSchema, itemTranslationFields } from "./item";
import {
  defaultItemFilters,
  itemFiltersSchema,
  itemOrderOptions,
} from "./item-filters";
import { useLocalizeItem } from "./localized-item";

//------------------------------------------------------------------------------
// Item Store
//------------------------------------------------------------------------------

export const itemStore = createEquipmentStore("item", {
  defaultEquipment: defaultItem,
  defaultFilters: defaultItemFilters,
  displayName: { en: "Adventuring Gear", it: "Attrezatura" },
  equipmentSchema: itemSchema,
  filtersSchema: itemFiltersSchema,
  matchesEquipment: (item, filters) =>
    matchesEquipment(item, filters) &&
    matchesBoolean(item.consumable, filters.consumable) &&
    matchesInclusion(item.type, filters.types) &&
    (filters.charges_min <= 0 || (item.charges ?? 0) >= filters.charges_min),
  orderOptions: itemOrderOptions,
  translationFields: itemTranslationFields,
  useLocalizeEquipment: useLocalizeItem,
});
