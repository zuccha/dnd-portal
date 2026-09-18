import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { localizeEquipmentModifier } from "../localized-equipment-modifier";
import { defaultWeaponModifier, weaponModifierTranslationFields } from "./weapon-modifier";
import {
  defaultWeaponModifierFilters,
  weaponModifierFiltersSchema,
  weaponModifierOrderOptions,
} from "./weapon-modifier-filters";

//------------------------------------------------------------------------------
// Weapon Modifier Store
//------------------------------------------------------------------------------

export const weaponModifierStore = createEquipmentModifierStore("weapon_modifier", {
  defaultFilters: defaultWeaponModifierFilters,
  defaultModifier: defaultWeaponModifier,
  displayName: { en: "Weapon Variants", it: "Varianti delle Armi" },
  filtersSchema: weaponModifierFiltersSchema,
  orderOptions: weaponModifierOrderOptions,
  translationFields: weaponModifierTranslationFields,
  localizeModifier: localizeEquipmentModifier,
});
