import { createEquipmentStore } from "../equipment-store";
import { useLocalizeWeapon } from "./localized-weapon";
import {
  defaultWeapon,
  defaultWeaponFilters,
  weaponFiltersSchema,
  weaponSchema,
} from "./weapon";

//------------------------------------------------------------------------------
// Weapon Store
//------------------------------------------------------------------------------

export const weaponStore = createEquipmentStore(
  { p: "weapons", s: "weapon" },
  {
    defaultEquipment: defaultWeapon,
    defaultFilters: defaultWeaponFilters,
    equipmentSchema: weaponSchema,
    filtersSchema: weaponFiltersSchema,
    useLocalizeEquipment: useLocalizeWeapon,
  },
);
