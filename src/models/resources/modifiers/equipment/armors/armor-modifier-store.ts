import { createEquipmentModifierStore } from "../equipment-modifier-store";
import {
  armorModifierSchema,
  armorModifierTranslationFields,
  defaultArmorModifier,
} from "./armor-modifier";
import {
  armorModifierFiltersSchema,
  armorModifierOrderOptions,
  defaultArmorModifierFilters,
} from "./armor-modifier-filters";
import { useLocalizeArmorModifier } from "./localized-armor-modifier";

//------------------------------------------------------------------------------
// Armor Modifier Store
//------------------------------------------------------------------------------

export const armorModifierStore = createEquipmentModifierStore(
  { p: "armor_modifiers", s: "armor_modifier" },
  {
    defaultFilters: defaultArmorModifierFilters,
    defaultModifier: defaultArmorModifier,
    displayName: { en: "Armor Variants", it: "Varianti delle Armature" },
    filtersSchema: armorModifierFiltersSchema,
    kinds: ["armor_modifier"],
    modifierSchema: armorModifierSchema,
    orderOptions: armorModifierOrderOptions,
    translationFields: armorModifierTranslationFields,
    useLocalizeModifier: useLocalizeArmorModifier,
  },
);
