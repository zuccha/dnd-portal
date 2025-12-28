import { createEquipmentStore } from "../equipment-store";
import { useLocalizeWeapon } from "./localized-weapon";
import { defaultWeapon, weaponSchema } from "./weapon";
import { defaultWeaponFilters, weaponFiltersSchema } from "./weapon-filters";

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
