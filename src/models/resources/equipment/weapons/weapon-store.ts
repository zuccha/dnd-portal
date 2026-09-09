import {
  matchesBoolean,
  matchesInclusion,
  matchesInclusionList,
} from "../../resource-filtering";
import { createEquipmentStore, matchesEquipment } from "../equipment-store";
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

export const weaponStore = createEquipmentStore("weapon", {
  defaultEquipment: defaultWeapon,
  defaultFilters: defaultWeaponFilters,
  displayName: { en: "Weapons", it: "Armi" },
  equipmentSchema: weaponSchema,
  filtersSchema: weaponFiltersSchema,
  matchesEquipment: (weapon, filters) =>
    matchesEquipment(weapon, filters) &&
    matchesBoolean(weapon.melee, filters.melee) &&
    matchesBoolean(weapon.ranged, filters.ranged) &&
    matchesInclusion(weapon.mastery, filters.masteries) &&
    matchesInclusion(weapon.type, filters.types) &&
    matchesInclusionList(weapon.properties, filters.properties),
  orderOptions: weaponOrderOptions,
  translationFields: weaponTranslationFields,
  useLocalizeEquipment: useLocalizeWeapon,
});
