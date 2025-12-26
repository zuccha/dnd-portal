import { createEquipmentsStore } from "../equipments-store";
import { useLocalizeWeapon } from "./localized-weapon";
import {
  defaultWeaponFilters,
  weaponFiltersSchema,
  weaponSchema,
} from "./weapon";

//------------------------------------------------------------------------------
// Weapons Store
//------------------------------------------------------------------------------

export const weaponsStore = createEquipmentsStore(
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
