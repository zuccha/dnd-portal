import { createEquipmentStore } from "../equipment-store";
import { useLocalizeWeapon } from "./localized-weapon";
import { defaultWeapon, weaponSchema, weaponTranslationFields } from "./weapon";
import {
  defaultWeaponFilters,
  weaponFiltersSchema,
  weaponOrderOptions,
} from "./weapon-filters";

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
    orderOptions: weaponOrderOptions,
    translationFields: weaponTranslationFields,
    useLocalizeEquipment: useLocalizeWeapon,
  },
);
