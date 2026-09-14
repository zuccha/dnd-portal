import { createEquipmentModifierStore } from "../equipment-modifier-store";
import { armorModifierTranslationFields, defaultArmorModifier } from "./armor-modifier";
import {
  armorModifierFiltersSchema,
  armorModifierOrderOptions,
  defaultArmorModifierFilters,
} from "./armor-modifier-filters";
import { useLocalizeArmorModifier } from "./localized-armor-modifier";

//------------------------------------------------------------------------------
// Armor Modifier Store
//------------------------------------------------------------------------------

export const armorModifierStore = createEquipmentModifierStore("armor_modifier", {
  defaultFilters: defaultArmorModifierFilters,
  defaultModifier: defaultArmorModifier,
  displayName: { en: "Armor Variants", it: "Varianti delle Armature" },
  filtersSchema: armorModifierFiltersSchema,
  orderOptions: armorModifierOrderOptions,
  translationFields: armorModifierTranslationFields,
  useLocalizeModifier: useLocalizeArmorModifier,
});
