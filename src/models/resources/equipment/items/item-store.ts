import { createEquipmentStore } from "../equipment-store";
import { defaultItem, itemSchema } from "./item";
import { defaultItemFilters, itemFiltersSchema } from "./item-filters";
import { useLocalizeItem } from "./localized-item";

//------------------------------------------------------------------------------
// Item Store
//------------------------------------------------------------------------------

export const itemStore = createEquipmentStore(
  { p: "items", s: "item" },
  {
    defaultEquipment: defaultItem,
    defaultFilters: defaultItemFilters,
    equipmentSchema: itemSchema,
    filtersSchema: itemFiltersSchema,
    useLocalizeEquipment: useLocalizeItem,
  },
);
