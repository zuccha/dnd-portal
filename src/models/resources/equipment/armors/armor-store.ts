import { createEquipmentStore } from "../equipment-store";
import { armorSchema, defaultArmor } from "./armor";
import { armorFiltersSchema, defaultArmorFilters } from "./armor-filters";
import { useLocalizeArmor } from "./localized-armor";

//------------------------------------------------------------------------------
// Armor Store
//------------------------------------------------------------------------------

export const armorStore = createEquipmentStore(
  { p: "armors", s: "armor" },
  {
    defaultEquipment: defaultArmor,
    defaultFilters: defaultArmorFilters,
    equipmentSchema: armorSchema,
    filtersSchema: armorFiltersSchema,
    useLocalizeEquipment: useLocalizeArmor,
  },
);
