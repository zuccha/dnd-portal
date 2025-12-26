import { createEquipmentsStore } from "../equipments-store";
import { armorFiltersSchema, armorSchema, defaultArmorFilters } from "./armor";
import { useLocalizeArmor } from "./localized-armor";

//------------------------------------------------------------------------------
// Armors Store
//------------------------------------------------------------------------------

export const armorsStore = createEquipmentsStore(
  { p: "armors", s: "armor" },
  armorSchema,
  armorFiltersSchema,
  defaultArmorFilters,
  useLocalizeArmor,
);

export const {
  useFromCampaign: useArmorsFromCampaign,
  useFilters: useArmorFilters,
  useNameFilter: useArmorNameFilter,
  useIsSelected: useIsArmorSelected,
  useSelectionCount: useArmorsSelectionCount,
  create: createArmor,
  update: updateArmor,
} = armorsStore;
