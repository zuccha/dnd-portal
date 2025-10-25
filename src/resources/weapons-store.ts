import { useLocalizeWeapon } from "./localized-weapon";
import { createResourcesStore } from "./resources-store";
import {
  defaultWeaponFilters,
  weaponFiltersSchema,
  weaponSchema,
} from "./weapon";

//------------------------------------------------------------------------------
// Weapons Store
//------------------------------------------------------------------------------

export const weaponsStore = createResourcesStore(
  { p: "weapons", s: "weapon" },
  weaponSchema,
  weaponFiltersSchema,
  defaultWeaponFilters,
  useLocalizeWeapon
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
