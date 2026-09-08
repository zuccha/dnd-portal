import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { useLocalizeWeaponModifier } from "./localized-weapon-modifier";
import {
  defaultWeaponModifier,
  weaponModifierSchema,
  weaponModifierTranslationFields,
} from "./weapon-modifier";
import {
  defaultWeaponModifierFilters,
  weaponModifierFiltersSchema,
  weaponModifierOrderOptions,
} from "./weapon-modifier-filters";

//------------------------------------------------------------------------------
// Weapon Modifier Store
//------------------------------------------------------------------------------

export const weaponModifierStore = createEquipmentModifierStore(
  "weapon_modifier",
  {
    defaultFilters: defaultWeaponModifierFilters,
    defaultModifier: defaultWeaponModifier,
    displayName: { en: "Weapon Variants", it: "Varianti delle Armi" },
    filtersSchema: weaponModifierFiltersSchema,
    modifierSchema: weaponModifierSchema,
    orderOptions: weaponModifierOrderOptions,
    translationFields: weaponModifierTranslationFields,
    useLocalizeModifier: useLocalizeWeaponModifier,
  },
);
