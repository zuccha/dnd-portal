import { createEquipmentStore } from "../equipment/equipment-store";
import { useLocalizeWeapon } from "./localized-weapon";
import {
  defaultWeaponFilters,
  weaponFiltersSchema,
  weaponSchema,
} from "./weapon";

//------------------------------------------------------------------------------
// Weapons Store
//------------------------------------------------------------------------------

export const weaponsStore = createEquipmentStore(
  { p: "weapons", s: "weapon" },
  weaponSchema,
  weaponFiltersSchema,
  defaultWeaponFilters,
  useLocalizeWeapon,
);

export const {
  useFromCampaign: useWeaponsFromCampaign,
  useFilters: useWeaponFilters,
  useNameFilter: useWeaponNameFilter,
  useIsSelected: useIsWeaponSelected,
  useSelectionCount: useWeaponsSelectionCount,
  create: createWeapon,
  update: updateWeapon,
} = weaponsStore;
