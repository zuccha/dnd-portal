import { createResourcesStore } from "../../resources-store";
import { defaultItemFilters, itemFiltersSchema, itemSchema } from "./item";
import { useLocalizeItem } from "./localized-item";

//------------------------------------------------------------------------------
// Items Store
//------------------------------------------------------------------------------

export const itemsStore = createResourcesStore(
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
