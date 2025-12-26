import { createEquipmentStore } from "../equipment-store";
import { defaultItemFilters, itemFiltersSchema, itemSchema } from "./item";
import { useLocalizeItem } from "./localized-item";

//------------------------------------------------------------------------------
// Items Store
//------------------------------------------------------------------------------

export const itemsStore = createEquipmentStore(
  { p: "items", s: "item" },
  itemSchema,
  itemFiltersSchema,
  defaultItemFilters,
  useLocalizeItem,
);

export const {
  useFromCampaign: useItemsFromCampaign,
  useFilters: useItemFilters,
  useNameFilter: useItemNameFilter,
  useIsSelected: useIsItemSelected,
  useSelectionCount: useItemsSelectionCount,
  create: createItem,
  update: updateItem,
} = itemsStore;
