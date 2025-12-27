import { createEquipmentStore } from "../equipment-store";
import {
  armorFiltersSchema,
  armorSchema,
  defaultArmor,
  defaultArmorFilters,
} from "./armor";
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
