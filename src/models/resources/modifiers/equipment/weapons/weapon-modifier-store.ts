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
  { p: "weapon_modifiers", s: "weapon_modifier" },
  {
    defaultFilters: defaultWeaponModifierFilters,
    defaultModifier: defaultWeaponModifier,
    filtersSchema: weaponModifierFiltersSchema,
    kinds: ["weapon_modifier"],
    modifierSchema: weaponModifierSchema,
    orderOptions: weaponModifierOrderOptions,
    translationFields: weaponModifierTranslationFields,
    useLocalizeModifier: useLocalizeWeaponModifier,
  },
);
